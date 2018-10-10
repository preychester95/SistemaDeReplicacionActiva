
var zmq = require('zmq');

var REP = "rep";
var DEALER = "dealer";
var PREFIJO = "rr";
var URL_REP = "tcp://127.0.0.1:5555";
var handlerList = [];
var usedHandlerList = [];
var nonRepliedReq = [];
var idRR = PREFIJO + process.pid;
//var URL_DEALER = "tcp://127.0.0.1:5555";

//var dealer = buildSocket(DEALER,PREFIJO);
var responder = zmq.socket(REP);

responder.on('message', function(request) {
  console.log("Received request: [", request.toString(), "]");
  nonRepliedReq.push(request["idClient"]);
  console.log("El array de respuestas no respondidas es: ",nonRepliedReq.toString());
  setTimeout(function() {
  	//Enviamos la petición al router a través del socket dealer
    //Enviamos la respuesta al Cliente
    responder.send("Hola Iosu, que duro es pasar una auditoria COBIT!!");
  }, 1000);
});

responder.bind(URL_REP, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Escuchando en el puerto 5555...");
  }
});

process.on('SIGINT', function() {
  responder.close();
});

function buildSocket(tipoSocket,idPrefijo){
	var sock = zmq.socket(tipoSocket);
	sock.identity = idPrefijo + process.pid;
	return sock;
}

