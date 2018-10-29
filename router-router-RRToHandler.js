var zmq = require('zmq');
var frontend = zmq.socket('router');
var backend = zmq.socket('router');

// ARGUMENTS
if( process.argv.length != 5 ) {
	console.log("Parametros incorrectos");
	process.exit(1);
}
var portClient = process.argv[2];
var portWorker = process.argv[3];
var verbose = process.argv[4] == "S";
// ARGUMENTS
if( verbose ){
	console.log('broker: frontend-router listening on tcp://*:' + portClient + ' ...');
	console.log('broker: backend-router listening on tcp://*:' + portWorker + ' ...');
}

// Let clients connect to the router:
frontend.bindSync('tcp://*:' + portClient);
// Let handlers connect to the router:
backend.bindSync('tcp://*:' + portWorker);

frontend.on('message', function(idRR, request) {
	// Get the request generated by the client
	var request = JSON.parse(request);
	if(verbose) {
		console.log("Received request: " + request.msg + " from manejador ( " + request.idManejador + " ).");
	}
	// Send the petition through backend router, to the chosen handler:
	var idHandler = request.idHandler;
	console.log('Id manejador: ' + idHandler);
	backend.send([idHandler, JSON.stringify(request)]);

	if(verbose){
		console.log("Sending request: " + request.msg + " to handler ( " + idHandler + " ) through backend.");
	}	
});

backend.on('message', function(idHandler, reply) {
	// Get the reply sent through the handler
	var reply = JSON.parse(reply);
	if (verbose) {
		console.log("Received response: " + reply.msg + " from handler ( " + idHandler + " ) from backend.");
	}
	// Send the response 
	var idRR = reply.idRR;
	console.log(idRR);
	frontend.send([idRR, JSON.stringify(reply)]);
	if (verbose) {
		console.log("Sending response: " + reply.msg + " to client ( " + idRR + " ) through frontend.");
	}
});