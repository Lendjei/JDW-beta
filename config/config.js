{
    "sipPort": 0,
    "webPort": 8000,
    "stunServer": "stun.sipnet.ru:3478",
    "webAccounts": [
        {
            "id": 1,
            "username": "admin",
            "password": "admin",
            "email": "admin@example.com"
        }
    ],
    "maxCalls": 10,
    "ringingTimeout": "30",
    "serviceName": "JIN",
    "activeAccount": 0,
    "sipAccounts": [
        {
            "host": "172.17.2.77",
            "expires": 60,
            "user": "_5",
            "password": "_4",
            "disable": 0
        }
    ],
    "logLevel": {
        "server": "DEBUG",
        "call": "DEBUG",
        "sip": "DEBUG",
        "http": "ERROR",
        "ua": "ERROR"
    },
    "appenders": [
        {
            "type": "console",
            "category": [
                "server",
                "ua",
                "call",
                "company"
            ]
        },
        {
            "type": "file",
            "filename": "logs/server.log",
            "maxLogSize": 1048576,
            "backups": 3,
            "category": "server"
        },
        {
            "type": "file",
            "filename": "logs/ua.log",
            "maxLogSize": 1048576,
            "backups": 10,
            "category": "ua"
        },
        {
            "type": "file",
            "filename": "logs/sip.log",
            "maxLogSize": 1048576,
            "backups": 10,
            "category": "sip"
        },
        {
            "type": "file",
            "filename": "logs/call.log",
            "maxLogSize": 1048576,
            "backups": 10,
            "category": "call"
        },
        {
            "type": "file",
            "filename": "logs/company.log",
            "maxLogSize": 1048576,
            "backups": 10,
            "category": "company"
        },
        {
            "type": "file",
            "filename": "logs/http.log",
            "maxLogSize": 1048576,
            "backups": 10,
            "category": "http"
        },
        {
            "type": "file",
            "filename": "logs/cdr.log",
            "maxLogSize": 1048576,
            "backups": 10,
            "category": "cdr"
        },
        {
            "type": "file",
            "filename": "logs/softphone.log",
            "maxLogSize": 1048576,
            "backups": 10,
            "category": "softphone"
        }
    ]
}