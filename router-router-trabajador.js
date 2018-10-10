var zmq = require('zmq');
var responder = zmq.socket('req');
var auxfunctions = require('./auxfunctions.js');
if( process.argv.length != 7 ) {
	console.log("Parametros incorrectos");
	process.exit(1);
}
var endpoint = process.argv[2];
var id = process.argv [3];
var disponibilidad = process.argv[4];
var atencion = process.argv[5];
var verbose = process.argv[6] == "S";
var num = 0;
if( verbose ) {
	console.log('worker ( ' + id + ' ) connected to ' + endpoint);
	console.log('worker ( ' + id + ' ) has sent READY msg: ' + disponibilidad);
}
responder.identity = id;
responder.connect('tcp://127.0.0.1:'+endpoint);
responder.on('message', function() {
	var args = Array.apply(null, arguments);
	if( verbose ) {
		console.log("worker ( " + id + " ) has received request: ( " + args[2] + " ) from client ( " + args[0] + " ).");
		auxfunctions.showArguments(args);
	}
	setTimeout(function() {
		if( verbose ) {
			console.log("worker ( " + id + " ) has send its reply");
			auxfunctions.showArguments([args[0], "", atencion ]);
			console.log("worker ( " + id + " ) has sent " + (++num) + " replies");
		}
		responder.send([args[0], "", atencion ]);
	}, 1000);
});
responder.send(disponibilidad);