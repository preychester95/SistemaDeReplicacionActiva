var zmq = require('zmq');
var frontend = zmq.socket('router');
var backend = zmq.socket('router');
var auxfunctions = require('./auxfunctions.js');
var WORKING = true;
var workers = {};
function getWorker() {
	var minWorks = calculeWorksmin();
	for (var key in workers) {
		if( workers[key][1] == minWorks )
			return key;
	}
	return null;
}
function calculeWorksmin() {
	var min = 999999999;
	for (var key in workers) {
		if( workers[key][1] < min )
			min = workers[key][1];
	}
	return min
}
function clearArgs(args) {
	var newArgs = args.reverse();
	newArgs.pop();
	newArgs.pop();
	return newArgs.reverse();
}
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
frontend.bindSync('tcp://*:' + portClient);
backend.bindSync('tcp://*:' + portWorker);
frontend.on('message', function() {
	var args = Array.apply(null, arguments);
	var worker = getWorker();
	if(verbose) {
		console.log("Received request: " + args[2] + " from client ( " + args[0] + " ).");
		auxfunctions.showArguments(args);
	}
	if( worker == null ) {
		console.log("We have not workers")
		frontend.send([args[0],"",'We have not workers']);
		return
	}
	if(verbose){
		console.log("Sending client: ( " + args[2] + " ) req to worker ( " + worker + " ) through backend.");
		auxfunctions.showArguments(args);
	}
	workers[worker][0] = WORKING;
	workers[worker][1] += 1;
	backend.send([worker,"",args]);
});

backend.on('message', function() {
	var args = Array.apply(null, arguments);
	if(workers[args[0]] == undefined) {
		workers[args[0]] = [!WORKING, 0];
		if(verbose) {
			console.log("Received request: ( " + args[2] + " ) from worker ( " + args[0] + " ).");
			auxfunctions.showArguments(args);
		}
	}
	else {
		workers[args[0]][0] = !WORKING;
		if(verbose) {
			console.log("Received request: ( " + args[2] + " ) from worker ( " + args[0] + " ).");
			auxfunctions.showArguments(args);
		}
	}
	if(args[2] != "READY") {
		console.log("Sending worker: ( " + args[0] + " ) rep to client ( " + args[2] + " ) through frontend.");
		args = clearArgs(args);
		auxfunctions.showArguments(args);
		frontend.send([args[0], "",args[2]]);
	}
	console.log(workers);
});