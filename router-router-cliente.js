var zmq = require('zmq');
var requester = zmq.socket('req');
// ARGUMENTS
if( process.argv.length != 6 ) {
	console.log("Parametros incorrectos");
	process.exit(1);
}
var ipBroker = process.argv[2];
var portBroker = process.argv[3];
var identityClient = process.argv[4];
var serviceRequest = process.argv[5];
requester.identity = identityClient;
requester.connect('tcp://' + ipBroker + ':' + portBroker );
console.log("Client ( " + identityClient + " ) connected to tcp://" + ipBroker + ":" + portBroker + " ...");
requester.on('message', function(msg) {
	console.log("Client ( " + identityClient + " ) has received reply: " + msg.toString());
	requester.close();
	process.exit(0);
});
console.log("Client ( " + identityClient + " ) has sent its msg: " + serviceRequest);
requester.send(serviceRequest);