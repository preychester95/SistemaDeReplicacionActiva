var zmq = require("zmq");
var rq = zmq.socket("req");

console.log('Hola');

rq.connect("tcp://127.0.0.1:8888"); //Connectto the server waiting in localhast in port 8888
rq.send("Hello");
rq.on("message", function(msg) {
    console.log("Response: " + msg);
});