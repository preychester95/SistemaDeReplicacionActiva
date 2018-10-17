//NOTE: Create one rr_module for each client
var zmq = require('zmq');

var REP = "rep";
var DEALER = "dealer";
var PREFIJO_RESP = "rr_resp";
var PREFIJO_DEAL = 'rr_deal';
var URL_REP = "tcp://127.0.0.1:5555";
var handlerList = []; //RELLENAR CUANDO CONOZCAMOS LOS IDS DE LOS HANDLERS
var usedHandlerList = [];
var idRR = PREFIJO_DEAL + process.pid;
var URL_DEALER = "tcp://127.0.0.1:6666"; //URL for the router
var repeatedTimeout;

// Instantiate a dealer socket for communication with the router
var dealer = buildSocket(DEALER,PREFIJO_DEAL);
dealer.connect(URL_DEALER); //Connect to the URL of the router MEJORABLE LEYENDO DE FICHERO

// Instantiate a responder socket for communication with the client
var responder = zmq.socket(REP);

// Set the url for the clients to connect
responder.bind(URL_REP, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Escuchando en el puerto 5555...");
  }
});

/******* RESPONDER LOGIC *******/
responder.on('message', function(request) {
  //Get the JSON send by a client.
  var request_parsed = JSON.parse(request); 
  
  //Store the timeout associated with the client that created the request, so we can stop it when we get its response:
  repeatedTimeout = setTimeout(function() {
  	//Enviamos la petición al router a través del socket dealer
    // Choose randomly a handler from the not yet used ones:
    var chosenHandler = chooseRandomNonUsedHandler(); 
    var requestToRouter = createJSONForRouter(request_parsed, chosenHandler); 

    // Add the given 
    dealer.send(JSON.stringify(requestToRouter)); //Send the new msg to the router:
  }, 1000);
});

/******* DEALER LOGIC *******/
dealer.on('message', function(reply) {
  reply = JSON.parse(reply);

  //Stop the timeout from the client that created the request of the gotten replied
  clearTimeout(repeatedTimeout);

  //Send the response to the client who requested it:
  responder.send(JSON.stringify(reply));

  //Reset all handlers as available:
  usedHandlerList = [];
  
});


process.on('SIGINT', function() {
  responder.close();
});

function buildSocket(tipoSocket,idPrefijo){
	var sock = zmq.socket(tipoSocket);
	sock.identity = idPrefijo + process.pid;
	return sock;
}

function chooseRandomNonUsedHandler() {
  //MEJORABLE SI EN VEZ DE BUSCAR REPETIDAMENTE UN ÍNDICE BORRAMOS LOS UTILIZADOS
  var handlerIdx = Math.floor((Math.random() * handlerList.length) + 1); //Choose a random index from your used handlerList
  var chosenHandler = handlerList[handlerIdx];
  while (usedHandlerList.includes(chosenHandler)) {
    handlerIdx = Math.floor((Math.random() * handlerList.length) + 1); 
    chosenHandler = handlerList[handlerIdx];
  }
  usedHandlerList.push(chosenHandler);
  return chosenHandler;
}

function createJSONForRouter(msg, idHandler) {
  //Añadimos el id del dealer al mensaje a enviar.
  msg.idHandler = idHandler;
  msg.rr = dealer.identity;
  return msg;
}