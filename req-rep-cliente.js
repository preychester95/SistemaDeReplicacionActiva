//REQUIRES
var zmq = require('zmq');
//VARIABLES
var requester = zmq.socket('req');
var i = 0;
//Comprobacion de parametros
if( process.argv.length < 5 ) {
console.log("Parametros incorrectos");
console.log("Modo de ejecucion: node hwclient.js IP_SERVIDOR PUERTO_SERVIDOR NUM_PETICIONES TXT_PETICION");
process.exit(1);
}
//Captura de parametros
var ipServer = process.argv[2];
var puertoServer = process.argv[3];
var numPeticiones = process.argv[4];
var msg = process.argv[5];
//Socket para la comunicacion
console.log("Conectando al server...");
requester.connect("tcp://" + ipServer + ":" + puertoServer);
//Envio de peticiones
for (var i = 0; i < numPeticiones; i++) {
console.log("Enviando peticion", i, '...');
requester.send(msg);
}
//LISTENERS
requester.on("message", function(reply) {
console.log("Reply recibido", i, ": [", reply.toString(),"]");
i += 1;
if (i == numPeticiones) {
console.log("Desconecto");
requester.close();
process.exit(0);
}
});
process.on('SIGINT', function() {
requester.close();
});
