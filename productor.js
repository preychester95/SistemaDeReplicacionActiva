//REQUIRES
var zmq = require('zmq');
//VARIABLES
var push=zmq.socket('push');
if(process.argv.length<4){
	console.log("Parametros incorrectos");
	console.log("Modo de ejecucion: node pullpushserver.js PUERTO_SERVIDOR NUM_MENSAJES TEXTO");
process.exit(1);
}
var port = process.argv[2];
var repeticiones = process.argv[3];
var msg = process.argv[4];
push.bind('tcp://*:' + port, function(err) {
if (err) console.log(err);
else console.log("Escuchando en el puerto "+port+"...");
});
for(i=0; i<repeticiones; i++) {
push.send(msg);
};
process.on('SIGINT', function() {
push.close();
})