//REQUIRES
var zmq = require('zmq');

//VARIABLES
var requester = zmq.socket('req');
var replyNbr = 0;
if( process.argv.length < 4 ) {
    console.log('Parametros incorrectos');
    console.log('Modo de ejecucion: node <nombre>.js IP PUERTO TXT');
    process.exit(1);
}

var ipBroker = process.argv[2];
var puertoBroker = process.argv[3];
var msg = process.argv[4];
var numLoop = 1;

requester.connect('tcp://' + ipBroker + ':' + puertoBroker);
requester.on('message', function(msg) {
    console.log('Respuesta recibida:', msg.toString());
    replyNbr += 1;
    if( replyNbr == numLoop ) {
        /* Cerrar cliente tras 1 segundo */
        setTimeout(function(){
            console.log("Desconecto");
            requester.close();
            process.exit(0);
        }, 1000)
        //console.log("Desconecto");
        //requester.close();
        //process.exit(0);
    }
});

for (var i = 0; i < numLoop; ++i) {
    requester.send(msg+' Peticion nº ' + (i));
}