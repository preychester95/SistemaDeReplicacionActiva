var zmq = require('zmq');

/******* Initialization *******/

if (process.argv.length != 3) {
    console.log(process.argv.length);
    throw new Error('The number of arguments expected for a client are ' + 3);
}

var params = process.argv[2].split(' ');

var PREFIX = 'client'; //Prefix 
var currentReq = 0;

//Internal properties:
var idClient = PREFIX + process.pid;

//Initialize a request socket with the ip and port assigned:
var rq = zmq.socket('req');
rq.connect('tcp://127.0.0.1:' + params[1]);

//We create a prototype msg whose interior msg will be changed in function of user input:
var prototypeMsg = {
    "idRequest": "",
    "idClient":idClient,
    "msg": ""
};

/******* RESPONDER LOGIC *******/

rq.on('message', function(response) {
    var parsedResponse = JSON.parse(response);
    console.log(parsedResponse.idRequest + ': Recibida respuesta del rr_module: \n' + response + '\n');
    var msg = parsedResponse.msg;
});
/******* USER INTERFACE LOGIC *******/


//Create an Interface for interacting with the user via console:

process.on('message', (input) => {
    var parsed_input = input.split(" "); //Transform the input from string to array of strings (by word)
    var command = parsed_input[0];
    if (command == 'set') {
        if (parsed_input.length == 3) {
            //Prepare a copy of the protoypeMsg to send the requested operation:
            var newMsg = prototypeMsg;
            //Create get msg:
            var setMsg = {
                "op": command,
                "args": parsed_input.slice(1, 3)
            }
            newMsg.idRequest = idClient + currentReq;
            currentReq = currentReq + 1;
            newMsg.msg = setMsg;
            console.log(newMsg.idRequest + ': Enviando peticion al modulo_rr conectado en el puerto '+params[1] + '\n' + setMsg.op + ' ' + setMsg.args + '\n');
            rq.send(JSON.stringify(newMsg))
        }
        else {
            console.log('Incorrect use of "set": set [var] [val].')
        }
    }
    else if (command == 'get') {
        if (parsed_input.length == 2) {
            //Prepare a copy of the protoypeMsg to send the requested operation:
            var newMsg = prototypeMsg;
            //Create get msg:
            var getMsg = {
                "op": command,
                "args": parsed_input.slice(1, 2)
            }
            newMsg.idRequest = idClient + currentReq;
            currentReq = currentReq + 1;
            newMsg.msg = getMsg;
            console.log(newMsg.idRequest + ': Enviando peticion al modulo_rr conectado en el puerto '+params[1] + '\n' + getMsg.op + ' ' + getMsg.args + '\n');
            rq.send(JSON.stringify(newMsg))
        }
        else {
            console.log('Incorrect use of "get": get [var].')
        }
    }
    else {
        console.log('Unrecognized command. Type "help" for a list of available commands.')
    }
});

