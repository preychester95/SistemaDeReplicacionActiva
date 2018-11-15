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
var Requests={};

var LocalSeq=0;
var UltimaReq=0;

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

console.log('El total de replicas en el array Replicas es: '+Replicas);



handler_RR.identity = 'handler'+idManejador;
handler_RR.connect('tcp://127.0.0.1:' + portRR);

handler_FO.identity = 'FO'+idManejador;
handler_FO.connect('tcp://127.0.0.1:' + portFO);

handler_TO.identity = 'TO'+idManejador;
handler_TO.connect('tcp://127.0.0.1:'+ portTO);
numberReplicas=Replicas.length;
console.log('Manejador con id: '+handler_RR.identity+' escuchando al router-routerRRToHandler por el puerto '+portRR+' y escuchando a las replicas por el puerto '+portFO);
console.log('Esperando...');

//Cuando nos devuelve el TO
handler_TO.on('message',function(requestTO){
	//Get the JSON send by a TO
  	var request_parsedTO = JSON.parse(requestTO);
	
	if (Sequenced.indexOf(request_parsedTO)==-1){
		console.log('Recibida peticion secuenciada desde TO');
		Sequenced.push(request_parsedTO);
		sendToReplicas(LocalSeq);
		LocalSeq=LocalSeq+1;
	}
	
});


//Cuando recibimos una peticion del cliente
handler_RR.on('message', function(request) {
	//Get the JSON send by a client.
  	var request_parsed = JSON.parse(request); 
  	console.log("Recibida peticion desde router-routerRRToHandler,enviada al manejador "+request_parsed.idHandler);
	//Si no existe 
	if (Sequenced.indexOf(request_parsed)==-1){
		console.log('Enviando para secuenciar a TO');
		handler_TO.send(request);
	}else{
		seq=Sequenced.indexOf(request_parsed);
		sendToReplicas(seq);
	}
});

//Desde las replicas
handler_FO.on('message', function(reply) {
	    console.log('Recibida respuesta de la replica: '+reply);
	    console.log('El numero de secuencia local es: '+LocalSeq);
		reply = JSON.parse(reply);
		//HAY QUE COMPROBAR SI TIENE EL MISMO NUMERO DE SECUENCIA Y SI LO HEMOS RECIBIDO ANTES DE OTRA FO????????????????
		if(reply.seq==LocalSeq){
			handler_RR.send(JSON.stringify(reply));
		}
		/*i=1;
		while(Sequenced[i]!=reply){
			i=i+1;
		}
		if(Sequenced[i]!=reply){
		}
		else{
			if (reply=LastServerReq){
				handler_RR.send(reply,msg);
			}
		}*/
});

function sendToReplicas(seq) {
	if (seq>LastServerReq+1){
		for (let j=LastServerReq;j<seq;j++){
			req=Sequenced[j];
			for(let r=0;r<numberReplicas;r++){
				req.idReplica = Replicas[r];
				req.idFO = handler_FO.identity;
				console.log("Enviando peticion secuenciada "+req+" al router-routerHandlerToReplica");
				handler_FO.send(JSON.stringify(req));
			}
		}
	}
	for(let r=0;r<numberReplicas;r++){
		req = Sequenced[seq];
		req.idReplica = Replicas[r];
		req.idFO = handler_FO.identity;
		console.log("Enviando peticion secuenciada "+req+" al router-routerHandlerToReplica");
		handler_FO.send(JSON.stringify(req));
	}
	LastServerReq=Math.max(LastServerReq, seq);
}

