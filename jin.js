var mars = require('mars');

/* remove original 'incomingCall' listener */
var incallF = mars.events._events['incomingCall'];
if (Array.isArray(incallF)) incallF = incallF[0];
mars.events.removeListener('incomingCall', incallF);

window.appExtension = mars.events;//for gui.js
window.sip = mars.sip;//for gui.js

new (require('./lib/softphone.js'))(mars);