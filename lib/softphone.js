var softphone = function (cntx) {
    var ua = cntx.sip;
    sUA = ua.sUA;
    var logCategory = 'softphone';
    var e = cntx.events;
    var dialogs = cntx.sip.dialogs;
    var standardPort = ':5060';
    new (require('./webAudio')).init(e, dialogs);

    //Call
    e.on('callTerminated', function (data) {console.log(' ********************************* incomingCall');
        if (dialogs[data.sessionID] && dialogs[data.sessionID].meta.status === 'answered') {
            e.emit('message', {category: logCategory, type: 'debug', msg: ' Event callTerminated dialog status: answered'});
            ua.bye(data.sessionID);
        } else {
            if (dialogs[data.sessionID] && dialogs[data.sessionID].meta.type === 'outgoing') {
                e.emit('message', {category: logCategory, type: 'debug', msg: ' Event callTerminated dialog type: outgoing'});
                ua.cancel(data.sessionID, 'Service cancel INVITE');
            } else {
                e.emit('message', {category: logCategory, type: 'debug', msg: ' Event callTerminated  type: incoming'});
                var rs = data.response;
                var rs_ = ua.makeResponse(rs, 480, 'Temporarily Unavailable');
                ua.setHeaders( rs_, data.sipAccountID );
                sUA[ data.sipAccountID ].send(rs_);
                e.emit('callEnded', data);
            }
        }
    });

    e.on('incomingCall', function (data) {
        console.log(' ********************************* incomingCall');

        e.emit('message', {category: logCategory, type: 'debug', msg: ' Event incomingCall'});
        var display_name = data.response.headers.from.name || ua.parseUri( data.response.headers.from.uri ).user;

        if (!ua.parseUri(data.response.headers.from.uri).port) {
            data.response.headers.from.uri = data.response.headers.from.uri + standardPort;
        }

        // Временно отключено
        //window.peerconnection_config = {};
        window.GUI.new_session({
            request: {
                getHeader: function () {
                    return true
                }
            },
            session: {
                data: {},
                terminate: function () {
                },
                on: function () {
                },
                answer: function () {
                },
                direction: 'incoming',
                remote_identity: {
                    display_name: display_name.replace(/"/g, ''),
                    uri: data.response.headers.from.uri
                }
            },
            sender: data
        })
    });

    e.on('answerIncomingCall', function (data) {
        console.log(' ********************************* answerIncomingCall');
        e.emit('message', {category: logCategory, type: 'debug', msg: ' Event answerIncomingCall'});
        e.emit('startScript', {sessionID: data.sessionID, response: data.response, uri: data.response.headers.from.uri, script: data.script, sipAccountID: data.sipAccountID});
    });

    e.on('ringing', function (data) {
        console.log(' ********************************* ringing');
        e.emit('message', {category: logCategory, type: 'debug', msg: ' Event ringing'});
        var session = window.GUI.sessions[String(data.uri)];

        if (session && dialogs && data.sessionID
            && dialogs[data.sessionID] && dialogs[data.sessionID].meta.type === 'outgoing') {
                window.GUI.setCallSessionStatus(session, 'in-progress');
        }
    });

    e.on('answered', function (data) {
        console.log(' ********************************* answered');
        e.emit('message', {category: logCategory, type: 'debug', msg: ' Event answered'});
        var session = window.GUI.sessions[String(data.uri)];
        if (session) {
            window.GUI.setCallSessionStatus(session, 'answered');
        }
    });

    e.on('dtmfData', function () {
        e.emit('message', {category: logCategory, type: 'debug', msg: ' Event dtmfData'});
        //e.emit('updateData', {source: 'Dialogs', data: dialogs});
    });

    e.on('cdr', function (data) {
        e.emit('message', {category: logCategory, type: 'debug', msg: ' Event callEnded'});
        if (data.uri) {
            if (!ua.parseUri(data.uri).port) {
                data.uri = data.uri + standardPort;
            }

            var session = window.GUI.sessions[String(data.uri)];
            if (session) {
                var cause = data.statusReason;

                window.GUI.setCallSessionStatus(session, "terminated", cause);
                window.GUI.removeSession(session, 1500);
                window.selfView.src = '';
                window.remoteView.src = '';
                window._Session = null;
            }
        }
    });

    //Message
    e.on('msgReceived', function (data) {
        console.log(' ********************************* msgReceived');
        e.emit('message', {category: logCategory, type: 'debug', msg: ' Event msgReceived New message'});
        var display_name = data.from.name || ua.parseUri(data.from.uri).user;

        if (!ua.parseUri(data.from.uri).port) {
            data.from.uri = data.from.uri + standardPort;
        }

        window.GUI.new_message({
            request: {
                getHeader: function () {
                    return true
                },
                body: data.msg
            },
            message: {
                data: {},
                direction: 'incoming',
                remote_identity: {
                    display_name: display_name.replace(/"/g, ''),
                    uri: data.from.uri,
                }
            },
            sender: {
                uri: data.from.uri,
                sessionID: data.sessionID,
                sipAccountID: data.sipAccountID,
                name: data.from.name
            }
        });
    });

};

module.exports = softphone;