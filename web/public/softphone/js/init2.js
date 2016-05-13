// Global variables (kill me).
var register_checkbox = null;
var phone_dialed_number_screen = null;
var phone_call_button = null;
var phone_chat_button = null;
var phone_dialpad_button = null;
var soundPlayer = null;
var _Session = null;  // The last RTCSession instance.
var appExtension;
var peerconnection_config;
var sipUri;
var sipPass;
var submit = false;



function formatDate(date) {
    var rez = new Date() - date;
    if (rez < 1000)
        return "только что";
    else if (rez < 1000 * 60)
        return Math.floor(rez / 1000) + " сек. назад";
    else if (rez < 1000 * 60 * 60)
        return Math.floor(rez / 1000 / 60) + " мин. назад";
    date = new Date(date);
    var obj = {
        dat: date.getDate(),
        month: date.getMonth() + 1,
        hours: date.getHours(),
        minutes: date.getMinutes()
    };
    for (var key in obj)
        obj[key] < 10 ? obj[key] = '0' + obj[key] : obj[key];
    return obj.dat + '.' + obj.month + '.' + date.getFullYear() % 100 + ' ' + obj.hours + ':' + obj.minutes;
}


localStorage.setItem('contacts', '{"success":true,"data":[["3", "Николаев Роман Павлович", "notAvailable"],["7", "Алексей Васенёв","offline"],["6", "Кондратьев Константин","online"],["3", "Николаев Роман Павлович", "notAvailable"],["7", "Алексей Васенёв","offline"],["6", "Кондратьев Константин","online"],["7", "Алексей Васенёв","offline"],["7", "Алексей Васенёв","offline"],["7", "Алексей Васенёв","offline"],["7", "Алексей Васенёв","offline"],["7", "Алексей Васенёв","offline"],["7", "Алексей Васенёв","offline"],["7", "Алексей Васенёв","offline"],["7", "Алексей Васенёв","offline"],["7", "Алексей Васенёв","offline"]]}');
localStorage.setItem('user_notifications', '{"success":true,"data":[["7", "inc_mes", "Ромка хватит работать, ложись спать!","2016-01-19T08:13:33.371Z"],["1", "inc_mes", "Ромка хватит работать, ложись спать!","2016-01-19T08:13:33.371Z"],["3", "miss_call", "Пропущенный звонок","2016-01-19T08:13:33.371Z"],["3", "miss_vid", "Пропущенный видеозвонок","2016-01-21T08:13:33.371Z"],["3", "out_mes", "Нууу мааааам!","2016-01-19T08:13:33.371Z"],["3", "inc_call", "Входящий звонок. Длительность: 00:01:33","2016-01-19T08:13:33.371Z"],["4", "out_call","Исходящий звонок. Длительность: 00:01:33","2016-01-19T08:13:33.371Z"],["", "out_vid","Исходящий видеозвонок. Длительность: 00:01:33","2016-01-19T08:13:33.371Z"]]}');
localStorage.setItem('status', '{"success":true,"data":[["1", "notAvailable"],["2", "offline"],["3", "online"],["4", "notAvailable"],["5", "offline"],["6", "online"],["7", "notAvailable"], ["8", "offline"],["9", "online"],["10", "notAvailable"],["11", "offline"],["12", "online"],["13", "online"],["14", "notAvailable"],["15", "offline"],["16", "online"],["17", "notAvailable"], ["18", "offline"],["19", "online"],["20", "notAvailable"]]}');

function updateStorage() {
    statusLists = JSON.parse(localStorage.getItem("status")).data;
    arrayAvatarsIcon = []; //JSON.parse(localStorage.getItem("last_notifications")).data; 
    userLastNotifs = [];
    arrayUserNotifs = JSON.parse(localStorage.getItem("user_notifications")).data;
    arrayListContacts = JSON.parse(localStorage.getItem("contacts")).data;
    uncontacted = [];

    for (var i = 0; i < arrayUserNotifs.length; i++) {
        for (var j = 0; j < userLastNotifs.length; j++) {
            if (arrayUserNotifs[i][0] == userLastNotifs[j][0]) {
                userLastNotifs.splice(j, 1);
            }
        }
        userLastNotifs.push(arrayUserNotifs[i]);
    }

    for (var i = 0; i < userLastNotifs.length; i++) {
        for (var i = 0; i < userLastNotifs.length; i++) {
            var flag = false;
            for (var j = 0; j < arrayListContacts.length; j++) {
                if (userLastNotifs[i][0] == arrayListContacts[j][0]) {
                    flag = true;
                }
            }
            if (flag == false) {
                uncontacted.push(userLastNotifs[i][0]);
            }
        }
    }

    for (var i = 0; i < userLastNotifs.length; i++) {
        var flag = false;
        for (var j = 0; j < arrayListContacts.length; j++) {
            if (userLastNotifs[i][0] == arrayListContacts[j][0]) {
                arrayAvatarsIcon.push([userLastNotifs[i][0], arrayListContacts[j][1], userLastNotifs[i][2] + " " + formatDate(Date.parse(userLastNotifs[i][3])), arrayListContacts[j][2]]);
                flag = true;
            }
        }
        if (flag == false) {
            for (var j = 0; j < statusLists.length; j++) {
                if (userLastNotifs[i][0] == statusLists[j][0]) {
                    if (userLastNotifs[i][4]) {
                        arrayAvatarsIcon.push([userLastNotifs[i][0], userLastNotifs[i][4], userLastNotifs[i][2] + " " + formatDate(Date.parse(userLastNotifs[i][3])), statusLists[j][1]]);
                    } else {
                        arrayAvatarsIcon.push([userLastNotifs[i][0], userLastNotifs[i][0], userLastNotifs[i][2] + " " + formatDate(Date.parse(userLastNotifs[i][3])), statusLists[j][1]]);
                    }
                }
            }
        }
    }
}


function auth_login_callback(res) {
  if (res===true){ 
      console.log('+++++++++++++++++++++');
    submit = true;
        var login_ws_servers = $("#ws_servers");
        var login_advanced_settings = $("#advanced-settings");
       var hostname = login_ws_servers.val().match(/\/\/([^:/]+)/);
        console.log(' - - - - - hostname: ' + hostname);
        if (hostname && hostname[1]) {
            hostname = hostname[1];
        } else {
            hostname = "";
        }

        var port = login_ws_servers.val().match(/\:([0-9]+)/);
        if (port && port[1]) {
            port = port[1];
        } else {
            port = "";
        }
 // Tryit JsSIP data.
    var tryit_sip_domain = hostname;

    //var tryit_ws_uri = "ws://ws1.versatica.com:10080"
    var tryit_ws_uri = ws_servers;
    var invitation_link_pre;

    /* invitation_link_pre = window.location.href + "?invited-by=";
     * заменено на код ниже, чтобы не было конфликтов с добавляемыми переменными*/

    var regV = /\?lang/gi;
    /*
     var result = window.location.href.match(regV);
     if (result) {
     invitation_link_pre = window.location.href + "&invited-by=";
     } else {
     invitation_link_pre = window.location.href + "?invited-by=";
     }
     */
    var result = hostname.match(regV);
    if (result) {
        invitation_link_pre = hostname + ":" + port + "&invited-by=";
    } else {
        invitation_link_pre = hostname + ":" + port + "?invited-by=";
    }

        result = hostname.match(regV);
        if (result) {
            invitation_link_pre = "http://" + hostname + ":" + port + "/client/&invited-by=";
        } else {
            invitation_link_pre = "http://" + hostname + ":" + port + "/client/?invited-by=";
        }
        if (window.getCurrentTransport() === 'webrtc') {
            login_advanced_settings.hide();
        }
        try {
            phoneInit();
        } catch (err) {
            console.warn(err.toString());
            alert(err.toString());
        }

//        return false;
  }else{console.log('--------------------------------');
 //   myAlert('Ошибка авторизации!', res);
    //ua = "";
  }
}


/*add some plugins materializecss beginning*/
$('.dropdown-button').dropdown({
    inDuration: 300,
    outDuration: 225,
    constrain_width: false, // Does not change width of dropdown to that of the activator
    hover: true, // Activate on hover
    gutter: 200, // Spacing from edge
    belowOrigin: false, // Displays dropdown below the button
    alignment: 'left' // Displays dropdown with edge aligned to the left of button
}
);

$('.dropdown-button1').dropdown({
    inDuration: 300,
    outDuration: 225,
    constrain_width: true, // Does not change width of dropdown to that of the activator
    hover: true, // Activate on hover
    gutter: 200, // Spacing from edge
    belowOrigin: false, // Displays dropdown below the button
    alignment: 'right' // Displays dropdown with edge aligned to the left of button
}
);
$(document).ready(function () {
    $('ul.tabs').tabs();
});
$(document).ready(function () {
    $('.scrollspy').scrollSpy();
});
$(document).ready(function () {
    $('.collapsible').collapsible({
        accordion: true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
});
$('[data-click]').on('click', function (e) {
    $($(this).data('click')).trigger('click');
});
/*add some plugins materializecss end*/

function createListContacts() {
//    // Создаем список контактов
//    var listContacts = $('#contacts_list');
//    var listItemsContacts = '<ul class="collection contacts-list" style="border: none; height:100%"; margin-bottom:20px>';
//    var length = arrayListContacts.length;
//    for (i = 0; i < length; i++) {
//        listItemsContacts += '<li class="collection-item avatar userList action z-depth-1 hoverable" id="cont_' + arrayListContacts[i][0] + '" style="width:45%; display:inline-block; margin-left:4%; margin-top:10px; margin-bottom:10px; background:rgba(255,255,255,0.9);">'
//                // аватар
//                + '<div class="circle userListIcon ' + arrayListContacts[i][2] + '_border" style="background: url(http://ballroom12.ru/images/avatars/' + arrayAvatarsIcon[i][0] + '.jpg) no-repeat center center;height:30px; width:30px;" > </div>'
//                // статус
//                + '<img src="img/' + arrayListContacts[i][2] + '.png"  alt="" class="circle userStatusIcon" style="height:15px; width:15px;" >'
//                // имя
//                + '<span class="title truncate"">' + arrayListContacts[i][1] + '</span>';
//
//    }
//
//    listItemsContacts += '</ul>';
//    listContacts.html(listItemsContacts);

    // Создаем список контактов
    var listContacts = $('#contacts_list');
    var listItemsContacts = '<ul class="collection contacts-list" style="border: none; height:100%"; margin-bottom:20px>';
    var length = arrayListContacts.length;
    for (i = 0; i < length; i++) {
        listItemsContacts += '<li class="collection-item userList action z-depth-1 hoverable" id="cont_' + arrayListContacts[i][0] + '" style="width:45%; height:100px; display:inline-block; margin-left:4%; margin-top:10px; margin-bottom:10px; background:rgba(255,255,255,0.9); cursor:pointer;">'
                // аватар
                + '<div style="display:flex; justify-content:initial; align-items:center; height:100%;position:relative;"><div class="circle userListIcon1 ' + arrayListContacts[i][2] + '_border" style="float: left;background: url(http://ballroom12.ru/images/avatars/' + arrayAvatarsIcon[i][0] + '.jpg) no-repeat center center;height:30px; width:30px;" > </div>'
                // статус
                + '<img src="web/public/softphone//images/' + arrayListContacts[i][2] + '.png"  alt="" class="circle userStatusIcon1" style="height:15px;float: left; width:15px;    position: absolute;" >'
                // имя
                + '<span class="title truncate" style="float: left; margin-left:2rem;">' + arrayListContacts[i][1] + '</span> </div>';

    }

    listItemsContacts += '</ul>';
    listContacts.html(listItemsContacts);

}

$(document).on('change', '#autoEnter', function () {
    $("#autoEnter").prop("checked") ? $('#btnEnter').text('Автовход') : $('#btnEnter').text('Войти');
});

function createLastMsg() {

    // Создаем список последних активностей
    var listUsers = $('#lastAction');
    var listItemsUsers = '<ul class="collection">';
    var length = arrayAvatarsIcon.length;
    for (i = 0; i < length; i++) {
        listItemsUsers += '<li style="min-height: 60px;background:transparent;     padding-left:calc(1rem + 35px);" class="collection-item avatar userList action" id="notif_' + arrayAvatarsIcon[i][0] + '">'
                //аватар
                + '<div style="background: url(http://ballroom12.ru/images/avatars/' + arrayAvatarsIcon[i][0] + '.jpg) no-repeat center center; "  alt="" class="circle userListIcon ' + arrayAvatarsIcon[i][3] + '_border" > </div>'
                // статус
                + '<img src="web/public/softphone//images/' + arrayAvatarsIcon[i][3] + '.png"  alt="" class="circle userStatusIcon" >'
                // имя
                + '<span class="title truncate" style="padding: 0;margin: 0; width: 80%;min-width: 90px;max-width: 170px;font-size: 13pt  !important;">' + arrayAvatarsIcon[i][1] + '</span></div>' + '<a href="#!" class="secondary-content">'
                + '<span class="new_msg badge">4</span></a>';
    }

    listItemsUsers += '</ul>';
    listUsers.html(listItemsUsers);
}

window.getCurrentTransport = function () {
    if (document.getElementById('transport_webrtc') && document.getElementById('transport_webrtc').checked) {
        return 'webrtc';
    }
    if (document.getElementById('transport_rtp') && document.getElementById('transport_rtp').checked) {
        return 'rtp';
    }
    //return 'rtp';
    return 'webrtc';
};


// Ветка
if (window.getCurrentTransport() === 'rtp') {
    peerconnection_config = peerconnection_config || undefined;
}

//function preview(token) {
//    $.getJSON("//ulogin.ru/token.php?host=" + encodeURIComponent(location.toString()) + "&token=" + token + "&callback=?", function (data) {
//        data = $.parseJSON(data.toString());
//        console.log(data);
//        if (!data.error) {
//            //alert("Привет, " + data.first_name + " " + data.last_name + "!");
//            //$("#userName").html("Пользователь: <b>" + data.first_name + " " + data.last_name + "<b>");
//            if ($("#login-form-from-invitation").css("display") == "none") {
//                $("#btnEnter").click();
//            } else {
//                $("#login-form-from-invitation input").val(data.first_name + " " + data.last_name);
//                $("#ulogin_auth2").click();
//            }
//        }
//    });
//}

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function hideAuth() {
    // Remove login page.
    $("#login-full-background").fadeOut(1000, function () {
        $(".balloonTip").css("display", "none");
        $(this).remove();
    });
    $("#login-box").fadeOut(1000, function () {
        $(this).remove();
    });
}

//$(document).on('click', function (event) {
//    console.log('---------');
//        console.log(event.target.id);
//    });


$(document).bind('click', function (event) {
    if ($(event.target).closest('#numpad_test').length)
        return;
    $('#test4').fadeOut(700);
    event.stopPropagation();

});


$(document).ready(function () {

    updateStorage();
    $('ul.collapsible').unbind('click'); //чтобы не закрывался список последних действий

    $('#test4, #phone-page, #history, #guestLoginForm, #outgoingCall_Form, #incomingCall_Form, #chatCall, #outgoingVideo_Form, #contacts').hide();

    createLastMsg();
    createListContacts();

    $('#search_input').on('click', function () {
        $('#test4').hide();
    });

    $('#lastAction li.action').on('click', function () {
        $('#history').show();
    });

    $('#contacts li.action').on('click', function () {
        $('#history').show();
    });
    $('#outgoingCall').on('click', function () {
        $('#history').hide();
        $('#outgoingCall_Form').show();
    });

    $('#out_call_end').on('click', function () {
//        $('#outgoingCall_Form').hide();
//        $('#history').show();
    });

    $('#call_smb').on('click', function () {
        $('#test4').show();
    });

    /*временно*/
    $('#testIncCall').on('click', function () {
        $('#history').hide();
        $('#incomingCall_Form').show();
    });
    $('#testMsgIncCall').on('click', function () {
        $('#history').hide();
        $('#chatCall').show();
    });
    $('#backAction').on('click', function () {
        $('#chatCall').hide();
        $('#history').show();
    });
    $('#testMsgVideoCall').on('click', function () {
        $('#history').hide();
        $('#outgoingVideo_Form').show();
    });
    /*--------------*/

    $('#video_end').on('click', function () {
        $('#outgoingVideo_Form').hide();
        $('#history').show();
    });

    $('#contact_btn').on('click', function () {
        $('#history, #guestLoginForm, #outgoingCall_Form, #incomingCall_Form, #chatCall, #outgoingVideo_Form').hide();
        $('#contacts').show();
    });

    $('#button_backspace').on('click', function () {
        var str = $("#telephone").val();
        str = str.slice(0, -1);
        $("#telephone").val(str);
        if ($("#telephone").val() == '') {
            $('#label_telephone').removeClass("active");
        }
    });

    function disableSipAccount() {
        //if (window.getCurrentTransport() === 'rtp') {
        mars.events.request('settingsListData', {}, function (err, data) {
            if (err) {
                return false;
            }

            try {
                var config = JSON.parse(data[0].value);
                var sipAccount = config.sipAccounts[0];

                if (sipAccount) {
                    sipAccount['disable'] = 1;
                }

                // Сохранение sip Аккаунта в config.js
                mars.events.emit('updateData', {source: 'config', data: {sipAccounts: [sipAccount]}});
            } catch (err) {
                console.warn(err.toString());
            }
        });
        //}
    }

    function enableSipAccount() {
        //if (window.getCurrentTransport() === 'rtp') {
        mars.events.request('settingsListData', {}, function (err, data) {
            if (err) {
                return false;
            }

            try {
                var config = JSON.parse(data[0].value);
                var sipAccount = config.sipAccounts[0];

                if (sipAccount) {
                    sipAccount['disable'] = 0;
                }

                // Сохранение sip Аккаунта в config.js
                mars.events.emit('updateData', {source: 'config', data: {sipAccounts: [sipAccount]}});
            } catch (err) {
                console.warn(err.toString());
            }
        });
        //}
    }

    function sendNewSipAccount() {
        //if (window.getCurrentTransport() === 'rtp') {
        var login = document.getElementById("sip_uri").value;
        var pass = document.getElementById("sip_password").value;
        var host = document.getElementById("ws_servers").value;
        host = host.match(/\/\/([^:/]+)/);
        if (host && host[1]) {
            host = host[1];
        } else {
            host = "";
        }
        var sipAccount = {
            host: host,
            expires: 60,
            user: login,
            password: pass,
            disable: 0
        };

        sipUri = login + '@' + host;
        sipPass = pass;

        //console.log('************* sipUri ', sipUri);
        //console.log('************* sipPass ', sipPass);

        if (login && pass && host) {

            /* Если аккаунт не был изменен, проверяем его статус подключения.
             В случае если подключен, авторизуем
             */
            mars.events.request('sipAccounts', {}, function (err, data) {
                if (err) {
                    return false;
                }

                if (data && data[0] && data[0].user && data[0].host && data[0].password) {
                    var curSipUri = data[0].user + '@' + data[0].host;

                    if ((curSipUri == sipUri) && (sipPass == data[0].password)) {
                        mars.events.request('getStatusUAList', {}, function (err, statusUa) {
                            if (err) {
                                return false;
                            }
                            if (statusUa && statusUa[0] && statusUa[0].name && (statusUa[0].name == curSipUri)) {
                                if (statusUa[0].status && statusUa[0].status == 1) {
                                    hideAuth();
                                } else {
                                    Y_U_NO('Registration failure', 2000);
                                }
                            }
                        });
                    }
                }
                // Сохранение sip Аккаунта в config.js
                mars.events.emit('updateData', {source: 'config', data: {sipAccounts: [sipAccount]}});
                document.getElementById("transport_rtp").checked = true;
            });
        }
        //}
    }

    // Ветка
    //if (window.getCurrentTransport() === 'rtp') {
    mars.events.on('register', function (regSipAccount) {
        if (regSipAccount && regSipAccount.uri) {
            var uriParse = parsingUri(regSipAccount.uri);
            var regUri = uriParse.user + '@' + uriParse.host;

            // При успешной авторизации устанавливаем radio button в checked
            //document.getElementById("transport_rtp").checked = true;

            // Проверка на наличие элемента в dom $("#login-full-background").length > 0
            if (submit && (regUri == sipUri) && ($("#login-full-background").length > 0) && regSipAccount.status) {

                // Скрыть авторизационное окно
                if (regSipAccount.status == 'registered') {
                    mars.events.request('sipAccounts', {}, function (err, sipAccount) {
                        if (err) {
                            return false;
                        }

                        if (sipAccount && sipAccount[0] && sipAccount[0].user && sipAccount[0].host) {
                            var tmpSipUri = sipAccount[0].user + '@' + sipAccount[0].host;

                            if ((tmpSipUri == sipUri) && sipAccount[0].password && (sipAccount[0].password == sipPass)) {
                                hideAuth();
                            }
                        }
                        ;
                    });
                }

                // Показать сообщение об ошибке
                if (regSipAccount.status == 'unregistered') {
                    Y_U_NO('Registration failure', 2000);
                }
            }

            // Установить состояние подключения

            switch (regSipAccount.status) {
                case 'unregistered':
                    GUI.setStatus("disconnected", 'rtp');
                    break;
                case 'registered':
                    GUI.setStatus("registered", 'rtp');
                    break;
                default:
                    GUI.setStatus("connected", 'rtp');
                    break;
            }
            ;

        }
    });
    //}

    $('#use-tryit-account-link a').focus();

    // Global variables.
    var PageTitle = "JIN";
    document.title = PageTitle;

    register_checkbox = $("#phone > .status #register");
//    phone_dialed_number_screen = $("#phone > .controls  input.destination");
    phone_dialed_number_screen = $("#telephone");
    //phone_call_button = $("#phone > .controls > .dialbox > .dial-buttons > .call");
    phone_call_button = $('#callBtn');
    phone_chat_button = $("#phone > .controls > .dialbox > .dial-buttons > .chat");
//    phone_dialpad_button = $("#phone > .controls > .dialpad .button");numpad-btn
    phone_dialpad_button = $(".numpad-btn");
    soundPlayer = document.createElement("audio");
    soundPlayer.volume = 1;

    phone_call_button.click(function (event) {
        GUI.phoneCallButtonPressed();
    });

    phone_chat_button.click(function (event) {
        GUI.phoneChatButtonPressed();
    });

    // Local variables.

    /* var display_name = null;
     var sip_uri = null;
     var sip_password = null;
     var ws_servers = null;*/

    var hostname = window.location.hostname;
    var port = window.location.port;
    var display_name = null;
    var sip_uri = null;
    var sip_password = null;
    var ws_servers = "ws://" + hostname + ':' + port + '/sip';
    var db_host = "https://kloud24.com/storage";

    hostname = "172.17.2.77";
    port = ":8000";
    ws_servers = "ws://" + hostname + port + "/sip";
    sip_uri = "sip:" + $('#sip_uri').val() + "@" + hostname;

    // Ветка
    //if (window.getCurrentTransport() === 'rtp') {
    mars.events.on('refresh', function (type) {
        if (type === 'config') {
            mars.events.request('settingsListData', {}, function (err, data) {
                if (err) {
                    return;
                }

                var config;
                if (data && data[0] && data[0].value) {
                    try {
                        config = JSON.parse(data[0].value);
                    } catch (err) {
                        console.log(err);
                        return;
                    }
                }
                if (config && config.sipAccounts && config.sipAccounts[0]) {
                    if (config.sipAccounts[0].user && document.getElementById("sip_uri")) {
                        document.getElementById("sip_uri").value = config.sipAccounts[0].user;
                    }
                    if (config.sipAccounts[0].password && document.getElementById("sip_password")) {
                        document.getElementById("sip_password").value = config.sipAccounts[0].password;
                    }
                }
            })
        }
    });

    mars.events.emit('refresh', 'config');
    //}

    var ws_was_connected = false;

    var login_form = $("#loginForm");
    var login_inputs = $("#loginForm input");
    var login_display_name = $("#loginForm input#display_name");
    var login_sip_uri = $("#loginForm input#sip_uri");
    //  var login_sip_uri = ws_servers ;
    //var login_sip_password = $("#loginForm input#sip_password");
    var login_sip_password = $("#sip_password");
//    var login_ws_servers = $("#loginForm input#ws_servers");
    var login_ws_servers = $("#ws_servers");
    var login_Y_U_NO = $("#Y_U_NO");
    var login_Y_U_NO_text = $("#Y_U_NO p");
    var login_advanced_settings_link = $("#advanced-settings-link a");
    var login_advanced_settings = $("#advanced-settings");
    var login_advanced_settings_close = $("#advanced-settings .close");
    var login_advanced_settings_form = $("#advanced-settings-form");
    var login_use_trit_account_link = $("#use-tryit-account-link a");
    var login_form_from_invitation = $("#login-form-from-invitation");
    var login_display_name_from_invitation = $("#login-form-from-invitation input.display_name");
    var user_display_name = $("#phone-page #user_display_name");

    var div_webcam = $("div#webcam");
    var balloons = $("a.balloon");

    // Tryit JsSIP data.
    var tryit_sip_domain = hostname;

    //var tryit_ws_uri = "ws://ws1.versatica.com:10080"
    var tryit_ws_uri = ws_servers;
    var invitation_link_pre;

    /* invitation_link_pre = window.location.href + "?invited-by=";
     * заменено на код ниже, чтобы не было конфликтов с добавляемыми переменными*/

    var regV = /\?lang/gi;
    /*
     var result = window.location.href.match(regV);
     if (result) {
     invitation_link_pre = window.location.href + "&invited-by=";
     } else {
     invitation_link_pre = window.location.href + "?invited-by=";
     }
     */
    var result = hostname.match(regV);
    if (result) {
        invitation_link_pre = hostname + ":" + port + "&invited-by=";
    } else {
        invitation_link_pre = hostname + ":" + port + "?invited-by=";
    }



    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/

    // Initialization.
    login_ws_servers.val(tryit_ws_uri);


    login_advanced_settings_link.click(function () {
        login_advanced_settings_link.hideBalloon();
        login_advanced_settings.fadeIn(300);
        return false;
    });

    login_advanced_settings_close.click(function () {
        login_advanced_settings.fadeOut(300);
    });

    // Balloons.

    balloons.click(function () {
        return false;
    });

    $("a.balloon.display_name").balloon(getBalloonContent("login_display_name"));
    $("a.balloon.sip_uri").balloon(getBalloonContent("login_sip_uri"));
    $("a.balloon.sip_password").balloon(getBalloonContent("login_sip_password"));
    $("a.balloon.ws_uri").balloon(getBalloonContent("login_ws_uri"));
    login_advanced_settings_link.balloon(getBalloonContent("login_advanced_settings"));
    login_use_trit_account_link.balloon(getBalloonContent("login_login_use_trit_account"));
        

    login_form.submit(function () {
  //    auth function:1-auth on service kloud24. if true than
//    2 - auth on sip server      
    $.ajax({
        url:db_host+"/auth/login",
        jsonpCallback: "auth_login_callback",
        dataType:"jsonp",
        contentType: "application/json",
        data:"token="+btoa(login_sip_uri.val() + ":" + login_sip_password.val())
      });
        
 //       submit = true;
//        hostname = login_ws_servers.val().match(/\/\/([^:/]+)/);
//        console.log(' - - - - - hostname: ' + hostname);
//        if (hostname && hostname[1]) {
//            hostname = hostname[1];
//        } else {
//            hostname = "";
//        }
//
//        port = login_ws_servers.val().match(/\:([0-9]+)/);
//        if (port && port[1]) {
//            port = port[1];
//        } else {
//            port = "";
//        }
//
//        tryit_sip_domain = hostname;
//
//        result = hostname.match(regV);
//        if (result) {
//            invitation_link_pre = "http://" + hostname + ":" + port + "/client/&invited-by=";
//        } else {
//            invitation_link_pre = "http://" + hostname + ":" + port + "/client/?invited-by=";
//        }
//        if (window.getCurrentTransport() === 'webrtc') {
//            login_advanced_settings.hide();
//        }
//        try {
//            phoneInit();
//        } catch (err) {
//            console.warn(err.toString());
//            alert(err.toString());
//        }
//
       return false;
    });

    login_advanced_settings_form.submit(function () {
        try {
            phoneInit();
        } catch (err) {
            console.warn(err.toString());
            alert(err.toString());
        }
        return false;
    });


    login_use_trit_account_link.click(function () {
        showFormFromInvitation();
        return false;
    });


    login_form_from_invitation.submit(function () {
        login_display_name.val(login_display_name_from_invitation.val());
        useTryitAccount();
        phone_dialed_number_screen.val(invitedBy);
        phone_chat_button.click();
        return false;
    });

    // If there is a custom js/custom.js file then load it and directly use its JsSIP configuration.
    //$.getScript("js/custom.js", function(data, textStatus, jqxhr) {
    if (window.CustomJsSIPSettings) {
        console.info("*** CustomJsSIPSettings found in js/custom.js, bypassing login form...");

        login_display_name.val(CustomJsSIPSettings.display_name);
        login_sip_uri.val(CustomJsSIPSettings.uri);
        login_sip_password.val(CustomJsSIPSettings.password);
        login_ws_servers.val(CustomJsSIPSettings.ws_servers);

        login_form.submit();
    }

    var currentURL = parseUri(window.location.toString());

    // If it's an invitation automatically log-in.
    var invitedBy = currentURL.queryKey["invited-by"];
    if (invitedBy) {
        showFormFromInvitation();
    }

    var queryUser = currentURL.queryKey["user"];

//вывод подсказок при заполнении основной формы
    function getBalloonContent(item) {
        var balloon_text;
        /*
         switch (item)
         {
         case "login_display_name":
         balloon_text = "<p>Your common name</p>";
         break;
         case "login_sip_uri":
         balloon_text = "<p>Your SIP account URI</p>";
         break;
         case "login_sip_password":
         balloon_text = "<p>Your SIP account password</p>";
         break;
         case "login_ws_uri":
         balloon_text = "<p>Your SIP WebSocket server URI</p><p>Don't have one? Use our own OverSIP server to connect to your SIP domain!</p>";
         break;
         case "login_advanced_settings":
         balloon_text = "<p>Set JsSIP advanced settings</p>";
         break;
         case "login_login_use_trit_account":
         balloon_text = "<p>Click here to generate an account at our SIP and WebSocket servers</p><p>...and just enjoy!</p>";
         break;
         }
         
         return {
         contents: balloon_text,
         minLifetime: 100,
         classname: 'balloonTip',
         css: {
         border: 'solid 1px #FF2D66',
         padding: '4px 10px',
         fontSize: '100%',
         fontWeight: 'bold',
         textAlign: 'center',
         lineHeight: '2',
         backgroundColor: '#666',
         color: '#fff'
         }
         };*/
    }


    function getRandomUsername() {
        var user = 'xxxxxxxx'.replace(/[x]/g, function (c) {
            var r = window.Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        user = "_" + user;
        return user;
    }


    function useTryitAccount() {
        if (!queryUser) {
            login_sip_uri.val("sip:" + getRandomUsername() + "@" + tryit_sip_domain);
        } else {
            login_sip_uri.val("sip:" + queryUser + "@" + tryit_sip_domain);
        }
        login_sip_password.val("");
        login_ws_servers.val(tryit_ws_uri);

        login_form.submit();
    }


    function Y_U_NO(text, timeout) {
        timeout = timeout || 2000;

        login_Y_U_NO_text.text(text);
        login_Y_U_NO.show();
        login_Y_U_NO.fadeOut(timeout, function () {
            $(this).hide();
        });

        login_inputs.prop('disabled', true);
        window.setTimeout(function () {
            login_inputs.prop('disabled', false);
            login_Y_U_NO.hide();
        },
                timeout
                );
    }


    function showFormFromInvitation() {
        login_form.hide();
        login_advanced_settings_link.hide();
        login_use_trit_account_link.hide();
        login_form_from_invitation.show();
        login_display_name_from_invitation.focus();
    }

    function phoneInit() {
        console.log('-----------------------------');
        
        var configuration;

        // If js/custom.js was found then use its CustomJsSIPSettings object.
        if (window.CustomJsSIPSettings) {
            configuration = CustomJsSIPSettings;
        }

        // Otherwise load data from the forms.
        else {
            if (login_display_name.val() != "")
                display_name = login_display_name.val();
            if (login_sip_uri.val() != "") {
                //sip_uri = login_sip_uri.val();
                var str = "sip:_";
                var sipVal = "sip:" + login_sip_uri.val() + "@" + hostname;
                sip_uri = (login_sip_uri.val().substr(0, 5) === str) ? login_sip_uri.val() : sipVal;
            }
            if (login_sip_password.val() != "")
                sip_password = login_sip_password.val();
            if (login_ws_servers.val() != "") {
                ws_servers = login_ws_servers.val();
                // To JSON (in case of a simple string we must enclose between ").
                if (ws_servers) {
                    if (ws_servers.charAt(0) != "[")
                        ws_servers = '"' + ws_servers + '"'
                    ws_servers = window.JSON.parse(ws_servers);
                }
            }

            if (!sip_uri) {
                Y_U_NO("Y U NO SIP URI ?");
                return false;
            } else if (!ws_servers) {
                Y_U_NO("Y U NO WS URI ?");
                return false;
            }

            // Advanced Settings.

            var authorization_user = $("#advanced-settings-form input[name$='authorization_user']").val();
            var register = $("#advanced-settings-form input[name$='register']").is(':checked');
            var register_expires = window.parseInt($("#advanced-settings-form input[name$='register_expires']").val());
            var registrar_server = $("#advanced-settings-form input[name$='registrar_server']").val();
            var no_answer_timeout = window.parseInt($("#advanced-settings-form input[name$='no_answer_timeout']").val());
            var session_timers = $("#advanced-settings-form input[name$='session_timers']").is(':checked');
            peerconnection_config = JSON.parse($("#advanced-settings-form input[name$='peerconnection_config']").val());
            var use_preloaded_route = $("#advanced-settings-form input[name$='use_preloaded_route']").is(':checked');
            var connection_recovery_min_interval = window.parseInt($("#advanced-settings-form input[name$='connection_recovery_min_interval']").val());
            var connection_recovery_max_interval = window.parseInt($("#advanced-settings-form input[name$='connection_recovery_max_interval']").val());
            var hack_via_tcp = $("#advanced-settings-form input[name$='hack_via_tcp']").is(':checked');
            var hack_via_ws = $("#advanced-settings-form input[name$='hack_via_ws']").is(':checked');
            var hack_ip_in_contact = $("#advanced-settings-form input[name$='hack_ip_in_contact']").is(':checked');

            configuration = {
                log: {level: 'debug'},
                uri: sip_uri,
                //uri: "sip:" + display_name + "@" + hostname,
                password: sip_password,
                ws_servers: ws_servers,
                display_name: display_name,
                authorization_user: authorization_user,
                register: register,
                register_expires: /*register_expires*/ 40, //ws herokuapp.com timeout
                registrar_server: registrar_server,
                no_answer_timeout: no_answer_timeout,
                session_timers: session_timers,
                use_preloaded_route: use_preloaded_route,
                connection_recovery_min_interval: connection_recovery_min_interval,
                connection_recovery_max_interval: connection_recovery_max_interval,
                hack_via_tcp: hack_via_tcp,
                hack_via_ws: hack_via_ws,
                hack_ip_in_contact: hack_ip_in_contact
            };
        }

        try {
            // Ветка
            ua = new JsSIP.UA(configuration);

            sendNewSipAccount();
        } catch (e) {
            console.log(e.toString());
            Y_U_NO(e.message, 4000);
            return;
        }

        $("#phone > .status .user").text(sip_uri);
        phone_dialed_number_screen.focus();
        //div_webcam.show();

        // Ветка
        //if (window.getCurrentTransport() === 'webrtc') {
        // Transport connection/disconnection callbacks
        ua.on('connected', function (e) {

            // Ветка
            //if (window.getCurrentTransport() === 'webrtc') {
            document.title = PageTitle;
            GUI.setStatus("connected", "webrtc");
            // Habilitar el phone.
            $("#phone .controls .ws-disconnected").hide();
            ws_was_connected = true;
            //} else {
            //    webrtcOff();
            //}

        });

        ua.on('disconnected', function (e) {

            // Ветка
            //if (window.getCurrentTransport() === 'webrtc') {
            document.title = PageTitle;
            GUI.setStatus("disconnected", "webrtc");
            Y_U_NO('Disconnected', 4000);
            // Deshabilitar el phone.
            // $("#phone .controls .ws-disconnected").show();
            // Eliminar todas las sessiones existentes.
            $("#sessions > .session").each(function (i, session) {
                GUI.removeSession(session, 500);
            });

            if (!ws_was_connected) {
                //alert("WS connection error:\n\n- WS close code: " + e.data.code + "\n- WS close reason: " + e.data.reason);
                console.error("WS connection error | WS close code: " + e.code + " | WS close reason: " + e.reason);
                //if (! window.CustomJsSIPSettings) { window.location.reload(false); }
            }
            //}
        });

        function webrtcOn() {
            console.log('******************** WebRTC on *******************');
            console.warn("register_checkbox has been checked");
            // Don't change current status for now. Registration callbacks will do it.
            register_checkbox.attr("checked", false);
            // Avoid new change until the registration action ends.
            register_checkbox.attr("disabled", true);
            ua.register();
        }

        function webrtcOff() {
            console.log('******************** WebRTC off *******************');
            console.warn("register_checkbox has been unchecked");
            // Don't change current status for now. Registration callbacks will do it.
            register_checkbox.attr("checked", true);
            // Avoid new change until the registration action ends.
            register_checkbox.attr("disabled", true);
            ua.unregister();
        }

        //webrtcOff();

        register_checkbox.change(function (event) {
            // Ветка
            //if (window.getCurrentTransport() === 'webrtc') {
            if ($(this).is(":checked")) {
                webrtcOn();
                /*
                 console.warn("register_checkbox has been checked");
                 // Don't change current status for now. Registration callbacks will do it.
                 register_checkbox.attr("checked", false);
                 // Avoid new change until the registration action ends.
                 register_checkbox.attr("disabled", true);
                 ua.register();
                 */
            } else {
                webrtcOff();
                /*
                 console.warn("register_checkbox has been unchecked");
                 // Don't change current status for now. Registration callbacks will do it.
                 register_checkbox.attr("checked", true);
                 // Avoid new change until the registration action ends.
                 register_checkbox.attr("disabled", true);
                 ua.unregister();
                 */
            }
            //}
        });

        $("#transport_webrtc").change(function () {
            webrtcOn();
            disableSipAccount();
        });

        $("#transport_rtp").change(function () {
            webrtcOff();
            enableSipAccount();
        });


        // NOTE: Para hacer unregister_all (esquina arriba-dcha un cuadro
        // transparente de 20 x 20 px).
        $("#unregister_all").click(function () {

            // Ветка
            //if (window.getCurrentTransport() === 'webrtc') {
            ua.unregister({'all': true});
            //}
        });

        // NOTE: Para desconectarse/conectarse al WebSocket.
        $("#ws_reconnect").click(function () {

            // Ветка
            //if (window.getCurrentTransport() === 'webrtc') {
            if (ua.transport.connected)
                ua.transport.disconnect();
            else
                ua.transport.connect();
            //}
        });
        //}
        phone_call_button.click(function (event) {
            GUI.phoneCallButtonPressed();
        });

        phone_chat_button.click(function (event) {
            GUI.phoneChatButtonPressed();
        });

        phone_dialpad_button.click(function () {
            if ($(this).hasClass("digit-asterisk"))
                sound_file = "asterisk";
            else if ($(this).hasClass("digit-pound"))
                sound_file = "pound";
            else
                sound_file = $(this).text();
            soundPlayer.setAttribute("src", pathSound + "dialpad/" + sound_file + ".ogg");
            soundPlayer.play();

            phone_dialed_number_screen.val(phone_dialed_number_screen.val() + $(this).text());
        });

        phone_dialed_number_screen.keypress(function (e) {
            // Enter pressed? so Dial.
            if (e.which == 13) {
                GUI.phoneCallButtonPressed();
            }
        });

        // Ветка
        //if (window.getCurrentTransport() === 'webrtc') {

        // Call/Message reception callbacks
        ua.on('newRTCSession', function (e) {

            // Ветка
            //if (window.getCurrentTransport() === 'webrtc') {
            // Set a global '_Session' variable with the session for testing.
            _Session = e.session;
            GUI.new_session(e)
            //}
        });

        ua.on('newMessage', function (e) {

            // Ветка
            //if (window.getCurrentTransport() === 'webrtc') {
            GUI.new_message(e)
            //}
        });

        // Registration/Deregistration callbacks
        ua.on('registered', function (e) {
            // При успешной авторизации устанавливаем radio button в checked
            if (window.getCurrentTransport() === 'webrtc') {
                //document.getElementById("transport_webrtc").checked = true;
            }

            // Ветка
            //if (window.getCurrentTransport() === 'webrtc') {
            console.info('Registered');
            GUI.setStatus("registered", "webrtc");
            user_display_name.text(login_display_name.val());

            //alert($(session).find(".peer > .display-name").text());
            //$("#phone-page #user_display_name").text(user_display_name);

            if (invitedBy) {
                // This fails in Chrome M38 (it does not propmt for getUseMedia).
                // phone_dialed_number_screen.val(invitedBy);
                // phone_call_button.click();
                // var invited_session = GUI.getSession("sip:" + invitedBy + "@" + tryit_sip_domain);
                // invitedBy = null;

                // $(invited_session).find(".chat > input[type='text']").val("Hi there, you have invited me to call you :)");
                // var e = jQuery.Event("keydown");
                // e.which = 13  // Enter
                // $(invited_session).find(".chat > input[type='text']").trigger(e);
                // $(invited_session).find(".chat > input[type='text']").focus();

                // So let's just chat.
                phone_dialed_number_screen.val(invitedBy);
                phone_chat_button.click();
                var invited_session = GUI.getSession("sip:" + invitedBy + "@" + tryit_sip_domain);
                invitedBy = null;

                var lang = getUrlVars()["lang"];
                (lang == undefined || lang == "ru") ?
                        $(invited_session).find(".chat > input[type='text']").val("Привет, поболтаем?") :
                        $(invited_session).find(".chat > input[type='text']").val("Hi there, wanna talk?");
                //  $(invited_session).find(".chat > input[type='text']").val("Hi there, wanna talk?");
                var e = jQuery.Event("keydown");
                e.which = 13;  // Enter
                $(invited_session).find(".chat > input[type='text']").trigger(e);
                $(invited_session).find(".chat > input[type='text']").focus();
            }

            // Remove login page.
            $("#login-full-background").fadeOut(1000, function () {

                $(".balloonTip").css("display", "none");
                $(this).remove();
            });
            $("#login-box").fadeOut(1000, function () {
                $(this).remove();
            });

            $("#call-invitation").show();
            //}

        });


        ua.on('unregistered', function (e) {

            // Ветка
            //if (window.getCurrentTransport() === 'webrtc') {
            console.info('Deregistered');
            GUI.setStatus("unregistered", "webrtc");

            Y_U_NO('Deregistered', 4000);
            //GUI.setStatus("connected", "webrtc");
            //}
        });


        ua.on('registrationFailed', function (e) {

            // Ветка
            //if (window.getCurrentTransport() === 'webrtc') {
            console.info('Registration failure');
            GUI.setStatus("registrationFailed", "webrtc");
            Y_U_NO('Registration failure', 4000);

            //GUI.setStatus("connected", "webrtc");

            if (!e.response) {
                //alert("SIP registration error:\n" + e.data.cause);
            } else {
                //  alert("SIP registration error:\n" + e.data.response.status_code.toString() + " " + e.data.response.reason_phrase)
            }
            // if (! window.CustomJsSIPSettings) { window.location.reload(false); }
            //}
        });

        // Start
        ua.start();

        // Remove login page.
        /*     $("#login-full-background").fadeOut(1000, function () {
         
         $(".balloonTip").css("display", "none");
         $(this).remove();
         });
         $("#login-box").fadeOut(1000, function () {
         //   alert(1);
         $(this).remove();
         });*/
        //}
        // Apply custom settings.
        if (window.Settings) {
            if (window.Settings.videoDisabledByDefault) {
                $('#enableVideo').prop('checked', false);
            }
        }


        if (window.getCurrentTransport() === 'webrtc') {
            // Invitation text and balloon for tryit.jssip.net accounts.

            if (ua.configuration.uri.host === tryit_sip_domain) {
                //  $("#call-invitation").show();
                $("#call-invitation").click(function () {
                    return false;
                });

                var invitation_link = invitation_link_pre + ua.configuration.uri.user;

                $("#call-invitation > a").balloon({
                    position: "bottom",
                    contents: "<p class='copy_text'></p><a href='" + invitation_link + "' target='_blank'>" + invitation_link + "</a>",
                    classname: "balloonInvitationTip",
                    css: {
                        border: 'solid 1px 5F9FCB ',
                        padding: '4px 10px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        lineHeight: '2',
                        backgroundColor: '#FFFFFF',
                        color: '#404040'
                    }
                });
            }
        }
        // Theme selectors.
        /*
         theme01.click(function (event) {
         $("body").removeClass();
         $("body").addClass("bg01");
         });
         
         theme02.click(function (event) {
         $("body").removeClass();
         $("body").addClass("bg02");
         });
         
         theme03.click(function (event) {
         $("body").removeClass();
         $("body").addClass("bg03");
         });
         
         theme04.click(function (event) {
         $("body").removeClass();
         $("body").addClass("bg04");
         });
         */
    }

});

