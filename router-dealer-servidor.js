// REQUIRES
var zmq = require('zmq');

// VARIABLES
var response = zmq.socket('rep');

if (process.argv.length < 5){
    console.log('Parametros incorrectos');
    console.log('Modo de ejecución: node <nombre>.js IP PUERTO TIEMPO TEXTO');
    process.exit(1);
}

var ipBroker = process.argv[2];
var puertoBroker = process.argv[3];
var time = process.argv[4];
var messege = process.argv[5];

response.connect('tcp://' + ipBroker + ':' + puertoBroker);

response.on('message', function(msg){
    console.log('Petición recibida: ', msg.toString());
    setTimeout(function(){
        response.send(messege);
    }, time);
});