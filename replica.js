// Requires
var zmq = require('zmq');

// Variables
var params = process.argv[2].split(' ');
var puerto = params[1];
var id_replica = params[0];
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
console.log('Conexión de Replica: ' + id_replica + ' abierta --> 127.0.0.1:' + puerto);

// Get request from handler
dealer.on('message', function(msg) {
  messege = JSON.parse(msg);
  //console.log('Recibida peticion: '+msg);
  console.log('\n' +'Petición recibida del cliente: ' + messege.idClient + ' desde el manejador: ' + messege.idHandler);
  // FILTER AND ORDERING
  seq = messege.seq; //Get sequence
  if(seq > expectedSeq){
    waiting[contWaiting] = messege;
    waiting = sortWaiting(waiting);
    contWaiting++;
  }
  if (expectedSeq == seq){
    // COMPUTE DEVUELVE VALOR/STRING EN FUNCIÓN DE GET/SET --> ¿SET ACTUALIZA? --> devuelve el string pero se necesitan mas de una petición para comprobar
    var res = compute(messege, dictionary);
    messege.result = res;
    messege.seqRequest = expectedSeq;
    executed[seq] = result;
    dealer.send(JSON.stringify(messege));
    console.log('\n' +'Petición enviada hacia el cliente: '+JSON.stringify(messege));
    expectedSeq = expectedSeq + 1;
    if(waiting[contWaiting]!=undefined){
        while(expectedSeq== waiting[contWaiting].seq){ // Con una petición falla ya que waiting esta vacio y no puede leer seq de undefined
          var result = compute(waiting[contWaiting], dictionary);
          executed[seq] = result;
          // Introducir resultado y expected sec en mensaje de vuelta
          dealer.send(JSON.stringify(messege));
          console.log('\n' +'Petición enviada hacia el cliente: '+JSON.stringify(messege));
          waiting.shift();
          expectedSeq = expectedSeq + 1;
        }
    }
  }
});

// Function for sort array of waiting
function sortWaiting(waiting){
  waiting.sort(function(a,b){
    return a.seq-b.seq;
  });
  return waiting;
}


// Function for compute the request
function compute(request, dictionary){
  // Get the operator
  op = request.msg.op;
  switch (op){
    case 'get':
      var key = request.msg.args[0];
      var res = get(dictionary, key);
      return res;
    case 'set':
      var key = request.msg.args[0];
      var value = request.msg.args[1];
      dictionary = set(dictionary, key, value);
      return 'Valor actualizado en clave: ' + key + ' con valor: ' + value; 
    default:
      console.log('Operación erronea');
  }
}

// Function that return an update dictionary
function set(dict,key,value){
  dict[key] = value;
  return dict;
}

// Function that return the value for the key in the dictionary
function get(dict,key){
  return dict[key] != undefined ? dict[key] : 'No existe un valor para esa clave';
}
