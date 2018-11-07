// Requires
var zmq = require('zmq');

// Arguments

// Variables
var puerto = process.argv[2];
var id_replica = 'R_1';
// Array for store executed requests
var executed = [];
var waiting = [];
var contWaiting = 0;
var expectedSeq = 1;
// Variables for compute client's operation
dictionary = {};


// Socket for communication with router
var dealer = zmq.socket('dealer');

// Open the connection
dealer.identity = id_replica;
dealer.connect('tcp://127.0.0.1:'+ puerto);

// Get request from handler
dealer.on('message', function(msg) {
  messege = JSON.parse(msg);
  console.log('Petición recibida del cliente: ' + messege.idClient + 'desde el manejador: ' + messege.idHandler);
  // FILTER AND ORDERING
  seq = messege.seq; //Get sequence
  if(seq > expectedSeq){
    waiting[contWaiting] = messege;
    waiting = sortWaiting(waiting);
    contWaiting++;
  }
  if (expectedSeq == seq){
    // COMPUTE DEVUELVE VALOR/STRING EN FUNCIÓN DE GET/SET --> ¿SET ACTUALIZA?
    var res = compute(messege, expectedSeq, dictionary);
    messege.result = res;
    messege.seqRequest = expectedSeq;
    executed[seq] = result;
    dealer.send(JSON.stringify(messege));
    console.log('Petición enviada hacia el cliente: ');
    expectedSeq = expectedSeq + 1;
    while(expectedSeq == waiting[contWaiting].seq){
      var result = compute(waiting[contWaiting], expectedSeq, dictionary);
      executed[seq].result = result;
      executed[seq].seqRequest = expectedSeq;
      dealer.send(JSON.stringify(messege));
      console.log('Petición enviada hacia el cliente: ');
      waiting.shift();
      expectedSeq = expectedSeq + 1;
    }
  }
});

function sortWaiting(waiting){
  //TODO: hacer ordenación de los elementos del array por orden de secuencia
  return waiting;
}


// Function for compute the request
function compute(request, expectedSeq, dictionary){
  // Generate JSON for response
  //var respJSON = { 
  //  'idClient' : request.idClient,
  //  'idHandler' : request.idHandler ,
  //  'seqRequest' : expectedSeq
  //};
  // Get the operator
  op = request.msg.op;
  switch (op){
    case 'get':
      var key = request.msg.args[1];
      var res = get(dictionary, key);
      return res;
    case 'set':
      var key = request.msg.args[1];
      var value = request.msg.args[2];
      dictionary = set(dictionary, key, value);
      return 'Valor actualizado';
    default:
      console.log('Operación erronea');
  }
}

// Devuelve el diccionario actualizado
function set(dict,key,value){
  dict[key] = value;
  return dict;
}

// Devuelve el valor que corresponde con la clave
function get(dict,key){
  return dict[key] != undefined ? dict[key] : 'No existe un valor para esa clave';
}
