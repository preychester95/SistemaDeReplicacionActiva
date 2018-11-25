//NOTE: Create one rr_module for each client
var zmq = require('zmq');
const EventEmitter = require('events'); //Allow events (used for errors)
ee = new EventEmitter();

console.log(process.argv[2]);

var params = process.argv[2].split(' ');

console.log('Los parametros de RR son: '+params);

var REP = "rep";
var DEALER = "dealer";
var PREFIJO_RESP = "rr_resp";
var PREFIJO_DEAL = 'rr_deal';
var URL_REP = "tcp://127.0.0.1:" + params[1];

var usedHandlerList = [];
var intervalTime = 1000; //1 second of delay for the timeout

//var idRR = PREFIJO_DEAL + process.pid;
var URL_DEALER = "tcp://localhost:" + params[2]; //URL for the router
console.log('URL_DEALER es: '+URL_DEALER);
//var repeatedTimeout;
var repeatedInterval;

var handlerList = params[3].split(','); //RELLENAR CUANDO CONOZCAMOS LOS IDS DE LOS HANDLERS

// Instantiate a dealer socket for communication with the router
var dealer = buildSocket(DEALER, params[0]);
dealer.connect(URL_DEALER); //Connect to the URL of the router MEJORABLE LEYENDO DE FICHERO

// Instantiate a responder socket for communication with the client
var responder = zmq.socket(REP);

// Set the url for the clients to connect
responder.bind(URL_REP, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Modulo_RR escuchando en el puerto " + params[1]+" conectado router-routerRRToHandler por el puerto "+params[2]);
  }
});

/******* RESPONDER LOGIC *******/
responder.on('message', function(request) {
  //Get the JSON send by a client.
  var request_parsed = JSON.parse(request); 
  //console.log(request_parsed);
  
  //We first do what is inside the setInterval() for it to be executed instantly:
  var chosenHandler = chooseRandomNonUsedHandler();
  var requestToRouter = createJSONForRouter(request_parsed, chosenHandler);
  console.log(request_parsed.idRequest + ': Enviando peticion desde module_rr al router-routerRRToHandler (escuchando en puerto '+params[2]+' ) destino manejador '+chosenHandler);
  dealer.send(JSON.stringify(requestToRouter)); //Send the new msg to the router:

  //Store the timeout associated with the client that created the request, so we can stop it when we get its response:
  repeatedInterval = setInterval(function() {
    //Enviamos la petición al router a través del socket dealer
    // Choose randomly a handler from the not yet used ones:
    chosenHandler = chooseRandomNonUsedHandler(); 
    requestToRouter = createJSONForRouter(request_parsed, chosenHandler); 

    // Add the given 
    console.log(request_parsed.idRequest + ': Enviando peticion desde module_rr al router-routerRRToHandler (escuchando en puerto '+params[2]+' ) destino manejador '+chosenHandler);
    dealer.send(JSON.stringify(requestToRouter)); //Send the new msg to the router:
  }, intervalTime);
});

/******* DEALER LOGIC *******/
dealer.on('message', function(reply) {  
  reply = JSON.parse(reply);
  console.log(reply.idRequest + ': Recibida respuesta desde router-routerRRToHandler');

  //Stop the timeout from the client that created the request of the gotten replied
  //clearInterval(repeatedTimeout);
  clearInterval(repeatedInterval);

  //Send the response to the client who requested it:
  responder.send(JSON.stringify(reply));

  //Reset all handlers as available:
  usedHandlerList = [];
  
});


process.on('SIGINT', function() {
  responder.close();
});

function buildSocket(tipoSocket,idRR){
	var sock = zmq.socket(tipoSocket);
	sock.identity = idRR;
	return sock;
}

function chooseRandomNonUsedHandler() {
  //CHECK:
  //If there is no non-used handler, set all of them as available and hope for some to be available:
  if (usedHandlerList.length == handlerList.length) {
    //dealer.disconnect(URL_DEALER); //DEBUG (Should be removed)
    //ee.emit('error', new Error('NO RESPONSE FROM ANY HANDLER')); //DEBUG (Should be removed)
    usedHandlerList = []; //DEBUG (Should be uncommented)
  }
  
  //MEJORABLE SI EN VEZ DE BUSCAR REPETIDAMENTE UN ÍNDICE BORRAMOS LOS UTILIZADOS
  var handlerIdx = Math.floor(Math.random() * handlerList.length); //Choose a random index from your used handlerList
  var chosenHandler = handlerList[handlerIdx];
  while (usedHandlerList.includes(chosenHandler)) {
    handlerIdx = Math.floor(Math.random() * handlerList.length); 
    chosenHandler = handlerList[handlerIdx];
  }
  usedHandlerList.push(chosenHandler);
  return chosenHandler;
}

function createJSONForRouter(request, idHandler) {
  //Añadimos el id del dealer al mensaje a enviar.
  request.idHandler = idHandler;
  request.idRR = dealer.identity;
  return request;
}