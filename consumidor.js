//REQUIRES
var zmq = require('zmq');
//VARIABLES
var pull = zmq.socket('pull');
var i = 0;
//REQUIRES
var zmq = require('zmq');
//VARIABLES
var push = zmq.socket('push');
if( process.argv.length < 3 ) {
console.log("Parametros incorrectos");
console.log("Modo de ejecucion: node pullpushclient.js IP_SERVIDOR PUERTO_SERVIDOR ");
process.exit(1);
}
var ipServer = process.argv[2];
var puertoServer = process.argv[3]
console.log("Conectando al server...");
pull.connect("tcp://" + ipServer + ":" + puertoServer);
//LISTENERS
pull.on("message", function(msg) {
console.log("Mensaje recibido: [", msg.toString(), "]");
});
process.on('SIGINT', function() {
requester.close();
});