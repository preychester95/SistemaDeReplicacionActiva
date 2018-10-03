//REQUIRES
var zmq = require('zmq');
//VARIABLES
var responder = zmq.socket('rep');
//Comprobacion de parametros
if( process.argv.length < 4 ) {
console.log("Parametros incorrectos");
console.log("Modo de ejecucion: node hwserver.js PUERTO_SERVIDOR NUM_SEGUNDOS TXT_RESPUESTA");
process.exit(1);
}
//Captura de parametros
var port = process.argv[2];
var segundos = process.argv[3];
var msg = process.argv[4];

//LISTENERS
responder.on('message', function(request) {
console.log("Peticion recibida: [", request.toString(), "]");
// do some 'work'
setTimeout(function() {
// send reply back to client.
responder.send("Petición cliente: " + request.toString() + " Respuesta servidor: " + msg);
}, segundos*1000);
 });
responder.bind('tcp://*:' + port, function(err) {
if (err) console.log(err);
else console.log("Escuchando en el puerto "+port+"...");
});
process.on('SIGINT', function() {
responder.close();
});