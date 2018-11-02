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
keyValue = {};


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
    var res = compute(messege, expectedSeq);
    messege.result = res;
    executed[seq] = result;
    dealer.send(JSON.stringify(messege));
    console.log('Petición enviada hacia el cliente: ');
    expectedSeq = expectedSeq + 1;
    while(expectedSeq == waiting[contWaiting].seq){
      var result = compute(waiting[contWaiting], expectedSeq);
      executed[seq] = result;
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
function compute(request, expectedSeq){
  // Generate JSON for response
  var respJSON = { 
    'idClient' : request.idClient,
    'idHandler' : request.idHandler ,
    'seqRequest' : expectedSeq
  };
  // Get the operator
  op = request.msg.op;
  switch (op){
    case 'get':
      return 'Petición';
    case 'set':
      break;
    default:
      console.log('Operación erronea');
  }
}

function put(key, value){
  this.keyValue.key = value;
}

function get(key){
  return (this.keyValue.key != undefined) ? this.keyValue.key : null;
}
