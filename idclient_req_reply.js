var zmq = require('zmq');
var requester = zmq.socket('req');

requester.identity = 'client' + process.pid;

requester.connect("tcp://127.0.0.1:5555");

console.log("Conectando a servidor hola mundo");

for (var i = 0 ; i < 10 ;i++){
    console.log("Mandando request", i, '...');
    requestJson = {"idCliente": requester.identity, "msg":"Hola", "Count":i};
    requester.send(JSON.stringify(requestJson));
}

var x = 0;
requester.on("mensaje", function(reply){
    console.log("Recibido reply", x, ": [", reply.toString(), ']');
    x += 1;
    if (x === 10){
        requester.close();
        process.exit(0);
    }
});

process.on("SIGINT", function(){
    requester.close();
    process.exit(0);
});