exports.init = function (e, dialogs) {
    try {
        var audioContext, context, audioInput, filter, recorder, recording;
        var navigator = window.navigator;
        navigator.getUserMedia = (navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia);

        var micBufferSize = 1024;//~ 20ms
        var sampleRate = 8000;
        var activeSession;

        /*
         var lineInPath = 'tmp/line_in.wav';
         function getFileWriter(fileName) {
         var wav = require('wav');
         return new wav.FileWriter(fileName, {
         format: 7, //pcmu
         channels: 1,
         sampleRate: 8000,
         bitDepth: 8
         });
         }
         var lineInWriter = getFileWriter(lineInPath);
         */

        if (navigator.getUserMedia) {
            navigator.getUserMedia({
                audio: true
            }, success, function (e) {
                alert('Error capturing audio.');
            });
        } else
            alert('getUserMedia not supported in this browser.');

        function success(e) {
            audioContext = window.AudioContext || window.webkitAudioContext;
            context = new audioContext();
            recording = false;

            // Create the filter
            filter = context.createBiquadFilter();
            // Create and specify parameters for the low-pass filter.
            filter.type = 'lowpass'; // Low-pass filter. See BiquadFilterNode docs
            filter.frequency.value = sampleRate / 2;
            /*
             var compressor = context.createDynamicsCompressor();
             compressor.threshold.value = -50;
             compressor.knee.value = 40;
             compressor.ratio.value = 12;
             compressor.reduction.value = -20;
             compressor.attack.value = 0;
             compressor.release.value = 0.25;
             */
            // the sample rate is in context.sampleRate
            audioInput = context.createMediaStreamSource(e);
            recorder = context.createScriptProcessor(micBufferSize, 1, 1);
            //var nodeGain = context.createGain();

            //window.document.getElementById("micGain").onchange = function () {
            //    if (nodeGain && nodeGain.gain)
            //        nodeGain.gain.value = this.value;
            //};
            //nodeGain.gain.value = 2.0;

            var resamplerObj = new Resampler(context.sampleRate, sampleRate, 1, micBufferSize, false);
            recorder.onaudioprocess = function (audioEvents) {
                //broadcast MicBuffer
                var micBuffer;
                for (var sID in dialogs)
                    if (activeSession == sID && dialogs[sID]._worker &&
                            dialogs[sID]._worker.sendAudioBuffer &&
                            dialogs[sID]._worker.sendAudioBuffer == '<MIC>')
                    {
                        if (!micBuffer) {
                            var left = audioEvents.inputBuffer.getChannelData(0);
                            micBuffer = resamplerObj.resampler(left);
                            micBuffer = converFloat32ToPcmu(micBuffer);
                        }
                        dialogs[sID]._worker.send(
                                {
                                    action: 'audioBuffer',
                                    params: {
                                        sessionID: dialogs[sID]._worker.sendAudioBuffer,
                                        data: micBuffer
                                    }
                                });
                    }
            };

            audioInput.connect(filter);
            //nodeGain.connect(filter);
            ///compressor.connect(recorder);
            filter.connect(recorder);
            recorder.connect(context.destination);
            //recorder.connect(context.destination);
        }
    } catch (e) {
        //console.log(e);
    }

    var playAudioDataSize = 160 * 4; //(20 * 4) ms  
    var playAudioData = new Buffer(0);//[];
    var g711 = new (require('../node_modules/mars/lib/rtp/G711').G711)();
    var Resampler = require('./resampler').Resampler;

    function converPcmuToFloat32(buffer) {
        //var bufferView = new DataView(arrayBuffer);
        var l = buffer.length;
        var floatBuffer = new Float32Array(l);

        //pcmu => Float
        for (var i = 0; i < l; i++)
            floatBuffer[i] = (g711.ulaw2linear(buffer.readUInt8(i))) / 0x7FFF;
        return floatBuffer;
    }

    function converFloat32ToPcmu(buffer) {
        var l = buffer.length;
        var buf = [];//new Int8Array(l);
        while (l--) {
            buf[l] = g711.linear2ulaw(buffer[l] * 0xFFFF); //convert to pcmu
        }
        return buf;//.buffer
    }

    this.playBuffer = function (obj) {
        if (activeSession != obj.sessionID)
            return;
        var data = obj.data;
        if (!context)
            return;
        playAudioData = Buffer.concat([playAudioData, new Buffer(data.data || data)]);
        //console.log(playAudioData);
        if (playAudioData.length < playAudioDataSize)
            return;

        var buffer = converPcmuToFloat32(playAudioData);
        playAudioData = new Buffer(0);

        var audioBuffer = context.createBuffer(1, buffer.length, sampleRate);
        audioBuffer.getChannelData(0).set(buffer);
        var source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);
        //source.onended = playNext;
        source.start();
    };
    e.on('playBuffer', this.playBuffer);
    e.on('setActiveSession', function (data) {
        e.emit('message', {category: 'softphone', sessionID: data.sessionID, type: 'info', msg: 'Set active sessionID "' + data.sessionID + '"'});
        activeSession = data.sessionID;
    });
    e.on('answered', function (data) {
        e.emit('setActiveSession', data);
    });
    e.on('callEnded', function (data) {
        for (var sID in dialogs) {
            if (sID !== data.sessionID)
                e.emit('setActiveSession', {sessionID: sID});
            break;
        }
    });
    /* Webkit Audio*/
};