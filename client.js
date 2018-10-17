var zmq = require('zmq');
const EventEmitter = require('events'); //Allow events (used for errors)
var readline = require('readline');

ee = new EventEmitter();

if (process.argv.length != 2 + 2) {
    console.log(process.argv.length);
    ee.emit('error', new Error('The number of arguments expected for a client are ' + 3));
}

var PREFIX = 'client'; //Prefix 

//Internal properties:
var idClient = PREFIX + process.pid;

//Initialize a request socket with the ip and port assigned:
var rq = zmq.socket('req');
rq.connect('tcp://' + process.argv[2 + 0] + ':' + process.argv[2 + 1]);

//We create a test msg to send via the socket:
var testMsg = {
    "idClient":idClient,
    "msg":
        {"op":"testOperation"}
};
rq.send(JSON.stringify(testMsg));
rq.on('message', function(response) {
    var parsedResponse = JSON.parse(response);
    console.log(parsedResponse);
    var msg = parsedResponse.msg;
    console.log('Replier responded with message: ' + msg.op);
});

//Create an Interface for interacting with the user via console:
/*
var rl = readline.createInterface({
    input: process.input,
    output: process.output
});


rl.setPrompt('Desired instruction: ');
rl.on('line', (input) => {
    console.log('Input leido: ' + input);
    console.log('Nueva orden: ');
});
*/