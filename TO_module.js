var zmq = require('zmq');

var sequencedRequests = [];
var TOpoint = zmq.socket('router');
var handlerList = ['TO1']; //RELLENAR CUANDO CONOZCAMOS LOS IDS DE LOS HANDLERS
//var auxfunctions = require('./auxfunctions.js');

// ARGUMENTS
port = process.argv[2];

// Let clients connect to the router:
TOpoint.bindSync('tcp://127.0.0.1:' + port);

TOpoint.on('message', function(idHandler, request) {
	// Get the request generated by the client
	console.log('Recibido peticion de un manejador ' + idHandler);
	var request = JSON.parse(request);

	var position = getPosition(request);
	if (position != -1) {
		console.log('La peticion ya tiene secuencia por lo que hacemos broadcast a todos los manejadores');
		broadCastToHandlers(sequencedRequests[position]);
	}
	else {
		console.log('La peticion NO tiene secuencia. La secuenciamos y hacemos broadcast a todos los manejadores');
		request.seq = sequencedRequests.length + 1;
		sequencedRequests.push(request);
		broadCastToHandlers(request);
	}
});

function getPosition(request) {
	if (sequencedRequests.length <= 0)
		return -1;
	var i = 0;
	while ((i < sequencedRequests.length) && (sequencedRequests[i].idRequest != request.idRequest)) {
		i = i + 1;
	}
	if (sequencedRequests[i].idRequest == request.idRequest) {
		return i;
	}
	else {
		return -1;
	}
}

function broadCastToHandlers(request) {
	handlerList.forEach(function(handler) {
		console.log('Enviando a handler ' + handler);
		TOpoint.send([handler, JSON.stringify(request)]);
	}) 
}