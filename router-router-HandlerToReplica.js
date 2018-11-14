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
	console.log('broker: frontend-router listening on tcp://127.0.0.1:' + portClient + ' ...');
	console.log('broker: backend-router listening on tcp://127.0.0.1:' + portWorker + ' ...');
}

// Let clients connect to the router:
frontend.bindSync('tcp://127.0.0.1:' + portClient);
// Let handlers connect to the router:
backend.bindSync('tcp://127.0.0.1:' + portWorker);

frontend.on('message', function(idHandler, request) {
	// Get the request generated by the client
	console.log('Recibida peticion desde manejador');
	var request = JSON.parse(request);
	// Send the petition through backend router, to the chosen handler:
	var idReplica = request.idReplica;
	console.log('Enviando peticion a la replica ' + idReplica);
	backend.send([idReplica, JSON.stringify(request)]);	
});

backend.on('message', function(idReplica, reply) {
	// Get the reply sent through the handler
	console.log("La peticion es: "+reply);
	var reply = JSON.parse(reply);
	console.log("Recibida respuesta de la replica, enviando al manejador "+reply.idHandler);
	// Send the response 
	frontend.send([reply.HandlerReplica, JSON.stringify(reply)]);
});