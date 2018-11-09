var zmq = require('zmq');
var handler_RR = zmq.socket('dealer');
var handler_Replica = zmq.socket('dealer');
var handler_TO = zmq.socket('dealer');
const fs = require('fs'); //File management

var params = process.argv[2].split(' ');

//Ultima peticion servida
var LastServerReq=0;
//Numero de secuencia
var seq;
//Variables del sequenciador
//Hay que ver cual de las dos siguentes funciona
//En el array sequenced se guarda el json
var Sequenced=[];
var Requests={}
var Replicas=[];

var LocalSeq=0;
var UltimaReq=0;
// let path_replicas = '../Files/replicas_ids.txt';

// replicas_data=[];
// fs.readFile(path_replicas,'utf8',function(err,data){
// 	replicas_data=data.split('\n');
// 	for (let i=0;i<replicas_data.length-1;i++){
// 		Replicas_Total=replicas_data.split(' ');
// 		console.log(Replicas_Total);
// 		Replicas.push(Replicas_Total[0]);
// 		console.log(Replicas);
// 	}
// });
Replicas=params[4].split(',');
console.log(Replicas);


//RR
var portRR = params[1];
//Replicas
var portReplica= params[3];
//TO
var portTO=params[2];

handler_RR.identity = params[0];
handler_RR.connect('tcp://127.0.0.1:' + portRR);

handler_Replica.identity = 'FO1'
handler_Replica.connect('tcp://127.0.0.1:' + portReplica);

handler_TO.identity = 'TO1';
handler_TO.connect('tcp://127.0.0.1:'+ portTO);
numberReplicas=Replicas.length;
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
  	console.log("Recibida peticion desde router-routerRRToHandler,enviando al manejador "+request_parsed.idHandler);
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
handler_Replica.on('message', function(reply) {
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
				//req.idFO = handler_Replica.identity;
				console.log("Enviando peticion secuenciada "+req+" al router-routerHandlerToReplica");
				handler_Replica.send(JSON.stringify(req));
			}
		}
	}
	for(let r=0;r<numberReplicas;r++){
		req = Sequenced[seq];
		req.idReplica = Replicas[r];
		//req.idFO = handler_Replica.identity;
		console.log("Enviando peticion secuenciada "+req+" al router-routerHandlerToReplica");
		handler_Replica.send(JSON.stringify(req));
	}
	LastServerReq=Math.max(LastServerReq, seq);
}

