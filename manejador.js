var zmq = require('zmq');
var handler_RR = zmq.socket('dealer');
var handler_FO = zmq.socket('dealer');
var handler_TO = zmq.socket('dealer');

//Ultima peticion servida
var LastServerReq=0;
//Numero de secuencia
var seq;
//Variables del sequenciador
//Hay que ver cual de las dos siguentes funciona
//En el array sequenced se guarda el json
var Sequenced=[];
var array=[];
var Requests={};

var LocalSeq=0;
var UltimaReq=0;

var Tratados={}

//Parámetros
var params = process.argv[2].split(' ');


//RR
var portRR = params[1];
//TO
var portTO=params[2];
//Replicas
var portFO= params[3];
//IdManejador
var idManejador = params[4];
//Array de ids de Replicas
var Replicas = params[5].split(','); 

//console.log('El total de replicas en el array Replicas es: '+Replicas);



handler_RR.identity = 'handler'+idManejador;
handler_RR.connect('tcp://127.0.0.1:' + portRR);

handler_FO.identity = 'FO'+idManejador;
handler_FO.connect('tcp://127.0.0.1:' + portFO);

handler_TO.identity = 'TO'+idManejador;
handler_TO.connect('tcp://127.0.0.1:'+ portTO);
numberReplicas=Replicas.length;
console.log('\n' +handler_RR.identity+' escuchando al router-routerRRToHandler por el puerto '+portRR+' y escuchando a las replicas por el puerto '+portFO);

//Cuando nos devuelve el TO
handler_TO.on('message',function(requestTO){
	//Get the JSON send by a TO
  	var request_parsedTO = JSON.parse(requestTO);
	
	if (Sequenced.indexOf(request_parsedTO)==-1){
		console.log('\n' + request_parsedTO.idRequest + ': ' + handler_RR.identity + ': ' + 'Recibida peticion secuenciada desde TO');
		Tratados[request_parsedTO.idClient] = true;//Apuntamos que estamos tratando al cliente que nos ha enviado esta petición:
		//console.log('Guardado cliente a tratar: ' + Object.keys(Tratados));
		Sequenced.push(request_parsedTO);
		//console.log('Sequenced: '+JSON.stringify(Sequenced));
		seq=Sequenced.indexOf(request_parsedTO);
		array.push(seq+1);
		sendToReplicas(seq);
		LocalSeq=LocalSeq+1;
	}
	
});

//Cuando recibimos una peticion del cliente
handler_RR.on('message', function(request) {
	//Get the JSON send by a client.
  	var request_parsed = JSON.parse(request); 
  	console.log('\n' +handler_RR.identity + ": " + request_parsed.idRequest + ": Recibida peticion desde router-routerRRToHandler");
	//Si no existe 
	if (Sequenced.indexOf(request_parsed)==-1){
		//console.log('Enviando para secuenciar a TO');
		handler_TO.send(request);
	}else{
		seq=Sequenced.indexOf(request_parsed);
		array.push(seq+1);
		Tratados[request_parsed.idClient] = true;//Apuntamos que estamos tratando al cliente que nos ha enviado esta petición:
		sendToReplicas(seq);
	}
});

//Desde las replicas
handler_FO.on('message', function(reply) {
		reply = JSON.parse(reply);
		//HAY QUE COMPROBAR SI TIENE EL MISMO NUMERO DE SECUENCIA Y SI LO HEMOS RECIBIDO ANTES DE OTRA FO????????????????
		//console.log('\n' + reply.idRequest + ": Recibida respuesta desde replica asociada a cliente: "+reply.idClient + "\nSecuencia peticion: " + reply.seq + ", Secuencia local: " + JSON.stringify(array));
		//console.log('Respuesta'+JSON.stringify(reply));

		// COMPROBAR: Se ha utilizado un array para comprobar las peticiones tratadas:
		if(array.indexOf(reply.seq)!=-1 && Tratados[reply.idClient]){
			console.log('\n' +reply.idRequest + ": Recibida respuesta de cliente tratable: " + reply.idClient);
			handler_RR.send(JSON.stringify(reply)); //Respondemos al cliente
			Tratados[reply.idClient] = false; //Indicamos que ya no estamos tratando a este cliente.
		}
});

function sendToReplicas(seq) {
	if (seq>LastServerReq+1){
		for (let j=LastServerReq;j<seq;j++){
			req=Sequenced[j];
			for(let r=0;r<numberReplicas;r++){
				req.idReplica = Replicas[r];
				req.idFO = handler_FO.identity;
				//console.log("Enviando peticion secuenciada "+req+" al router-routerHandlerToReplica");
				handler_FO.send(JSON.stringify(req));
			}
		}
	}
	for(let r=0;r<numberReplicas;r++){
		req = Sequenced[seq];
		req.idReplica = Replicas[r];
		req.idFO = handler_FO.identity;
		//console.log("Enviando peticion secuenciada "+req+" al router-routerHandlerToReplica");
		handler_FO.send(JSON.stringify(req));
	}
	LastServerReq=Math.max(LastServerReq, seq);
}