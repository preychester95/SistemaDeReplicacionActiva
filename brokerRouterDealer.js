// REQUIRES
var zmq = require('zmq');

// VARIABLES
var socketRouter = zmq.socket('router');
var socketDealer = zmq.socket('dealer');

if (process.argv.length < 3){
    console.log('Parametros incorrectos');
    console.log('Modo de ejecución: node <nombre>.js Puerto_Router Puerto_Dealer');
    process.exit(1);
}

var puertoRouter = process.argv[2];
var puertoDealer = process.argv[3];

socketRouter.bindSync('tcp://*:' + puertoRouter);
socketDealer.bindSync('tcp://*:' + puertoDealer);

console.log('Intercambiando mensajes...');
socketRouter.on('message', function(){
    var args = Array.apply(null, arguments);
    socketDealer.send(args);
});

socketDealer.on('message', function(){
    var args = Array.apply(null, arguments);
    socketRouter.send(args);
});