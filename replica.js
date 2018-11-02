// Requires
var zmq = require('zmq');

// Arguments
if( process.argv.length != 5 ) {
	console.log("Error. Ejecución debe ser: node replica.js Ip Puerto_Router Id_Replica");
	process.exit(1);
}

// Variables
var ip = process.argv[2];
var puerto = process.argv[3];
var id_replica = process.argv[4];
// Array for store executed requests
var executed = [];
var expectedSeq = 1;
// Variables for compute client's operation
keyValue = {};


// Socket for communication with router
var dealer = zmq.socket('dealer');

// Open the connection
dealer.identity = id_replica;
dealer.connect('tcp://'+ ip + ':' + puerto);
console.log('Conexión abierta ' + id_replica + ' --> tcp://' + ip + ':' + puerto);

// Get request from handler
dealer.on('message', function(msg) {
  messege = JSON.parse(msg);
  console.log('Petición recibida del cliente: ' + messege.idClient + ' desde el manejador: ' + messege.idHandler);
  // FILTER AND ORDERING
  //seq = messege.seq; //Get sequence
  //if (expectedSeq == seq){
  //  var result = compute(messege, expectedSeq);
  //  executed[seq] = result;
  //  expectedSeq = expectedSeq + 1;
  //}
  //Send the response to the router:
  console.log("Enviando respuesta desde replica al router-router-HandlerToReplica "+messege.idHandler);
  dealer.send(JSON.stringify(messege));
});

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
      break;
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
