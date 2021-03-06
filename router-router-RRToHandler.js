var zmq = require('zmq');
var frontend = zmq.socket('router');
var backend = zmq.socket('router');

// ARGUMENTS
var portClient = process.argv[2];
var portWorker = process.argv[3];

// Let clients connect to the router:
frontend.bindSync('tcp://*:' + portClient);
// Let handlers connect to the router:
backend.bindSync('tcp://*:' + portWorker);


frontend.on('message', function(idRR, request) {
	// Get the request generated by the client
	var request = JSON.parse(request);
	// Send the petition through backend router, to the chosen handler:
	var idHandler = request.idHandler;
	console.log('\n' + request.idRequest +": Recibida peticion desde rr_module,enviando al manejador "+idHandler);
	backend.send([idHandler,JSON.stringify(request)]);	
});

backend.on('message', function(idHandler, reply) {
	// Get the reply sent through the handler
	var reply = JSON.parse(reply);
	console.log('\n' + reply.idRequest +": Recibida respuesta desde el manejador "+idHandler+" al rr_module "+reply.idRR);

	// Send the response 
	var idRR = reply.idRR;
	frontend.send([idRR, JSON.stringify(reply)]);
});