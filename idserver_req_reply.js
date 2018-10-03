var zmq = require('zmq');
var responder = zmq.socket('rep');

responder.identity = 'server' + process.pid;

responder.bind('tcp://127.0.0.1:5555', function(err){
    if(err){
        console.log(err);
    } 
    else {
        console.log("Escuchando en puerto 5555...");
    }
});

responder.on('message', function(request){
    requestJSON = JSON.parse(request.toString());
    console.log("Recibido request JSON: [", requestJSON, "]");

    replyJSON = {"idServer": responder.identity, "msg":"Mundo", "count": requestJSON["count"]};
    setTimeout(function(){
        responder.send(JSON.stringify(replyJSON));
    }, 1000);
});

process.on("SIGINT", function(){
    responder.close();
    process.exit();
});