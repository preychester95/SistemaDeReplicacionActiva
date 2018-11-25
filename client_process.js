var zmq = require('zmq');
var start=new Date();
var end=new Date();
var tiempo_actual=new Date();
var arrayTimes=[];
var allDates=[];
var elapsed=0;
var contador=0;


/******* Initialization *******/

if (process.argv.length != 3) {
    console.log(process.argv.length);
    throw new Error('The number of arguments expected for a client are ' + 4);
}

var params = process.argv[2].split(' ');
var numeroPeticiones=params[2];

var currentReq = 0;
var msgBuffer = [];
var available = true;

//Internal properties:
var idClient = params[0];

//Initialize a request socket with the ip and port assigned:
var rq = zmq.socket('req');
rq.connect('tcp://127.0.0.1:' + params[1]);

/******* RESPONDER LOGIC *******/

rq.on('message', function(response) {
    var parsedResponse = JSON.parse(response);
    console.log('\n' +parsedResponse.idRequest + ': Recibida respuesta del rr_module: \n' + response + '\n');
    var msg = parsedResponse.msg;
    start=arrayTimes[parsedResponse.idRequest];
    //console.log('start: '+start);
    end=Date.now();
    elapsed=(end-start)/1000;
    console.log('Tiempo entre peticion y respuesta: '+elapsed);
    allDates.push(elapsed);
    //console.log('Array de tiempos del cliente: '+parsedResponse.idClient+', '+allDates);
    contador=contador+1;
    //console.log('contador:'+contador+'peticiones: '+numeroPeticiones);
    if(contador==numeroPeticiones)
        process.send(allDates);
    if (msgBuffer.length != 0) {
        //Enviamos el siguiente mensaje encolado:
        msg = msgBuffer.shift();
        console.log('\n' +msg.idRequest + ': Desencolado mensaje -> Enviando peticion al modulo_rr conectado en el puerto '+params[1] + '\n');
        arrayTimes[msg.idRequest]=Date.now(); //Contamos el tiempo desde que se envía la petición (se ignora el tiempo de encolamiento)
        rq.send(JSON.stringify(msg)); 
    }
    else {
        //Permitimos tratar nuevas peticiones conforme lleguen:
        available = true;
    }
});
/******* USER INTERFACE LOGIC *******/

//Communication with the parent process:

process.on('message', (input) => {
    var parsed_input = input.split(" "); //Transform the input from string to array of strings (by word)
    var command = parsed_input[0];
    if (command == 'set') {
        if (parsed_input.length == 3) {
            //Prepare a copy of the protoypeMsg to send the requested operation:
            var newMsg = {
                "idRequest": "",
                "idClient":idClient,
                "msg": ""
            };
            //Create get msg:
            var setMsg = {
                "op": command,
                "args": parsed_input.slice(1, 3)
            }
            newMsg.idRequest = idClient + '_' +currentReq;
            currentReq = currentReq + 1;
            newMsg.msg = setMsg;

            if (available) {
                available = false;
                console.log('\n' +newMsg.idRequest + ': Enviando peticion al modulo_RR conectado en el puerto '+params[1] + '\n');
                rq.send(JSON.stringify(newMsg))
                arrayTimes[newMsg.idRequest]=Date.now();
            } else {
                console.log('\n' +newMsg.idRequest + ': Encolada peticion.');
                var tempVar = newMsg;
                msgBuffer.push(tempVar); //Almacenamos el mensaje generado para enviarlo después
                //console.log(msgBuffer);
            }
        }
        else {
            console.log('Incorrect use of "set": set [var] [val].')
        }
    }
    else if (command == 'get') {
        if (parsed_input.length == 2) {
            //Prepare a copy of the protoypeMsg to send the requested operation:
            var newMsg = {
                "idRequest": "",
                "idClient":idClient,
                "msg": ""
            };
            //Create get msg:
            var getMsg = {
                "op": command,
                "args": parsed_input.slice(1, 2)
            }
            newMsg.idRequest = idClient + '_' +currentReq;
            currentReq = currentReq + 1;
            newMsg.msg = getMsg;
            if (available) {
                available = false;
                console.log('\n' +newMsg.idRequest + ': Enviando peticion al modulo_rr conectado en el puerto '+params[1] + '\n');
                rq.send(JSON.stringify(newMsg))
                arrayTimes[newMsg.idRequest]=Date.now();
            } else {
                console.log('\n' +newMsg.idRequest + ': Encolada peticion.')
                var tempVar = newMsg;
                msgBuffer.push(tempVar); //Almacenamos el mensaje generado para enviarlo después
                //console.log(msgBuffer);
            }
        }
        else {
            console.log('Incorrect use of "get": get [var].')
        }
    }
    else {
        console.log('Unrecognized command. Type "help" for a list of available commands.')
    }
});