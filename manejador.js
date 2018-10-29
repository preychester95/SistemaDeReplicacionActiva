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
var Requests={}
var Replicas=['R_1'];

var LocalSeq=0;
var UltimaReq=0;

//RR
var portRR = process.argv[2];
//Replicas
var portFO= process.argv[4];
//TO
var portTO=process.argv[3];

handler_RR.identity = 'handler1';
handler_RR.connect('tcp://127.0.0.1:' + portRR);

handler_FO.identity = 'FO1'
handler_FO.connect('tcp://127.0.0.1:' + portFO);

handler_TO.identity = 'TO1';
handler_TO.connect('tcp://127.0.0.1:'+ portTO);
numberReplicas=Replicas.length;
console.log('Esperando...');

//Cuando nos devuelve el TO
handler_TO.on('message',function(requestTO){
	//Get the JSON send by a TO
  	var request_parsedTO = JSON.parse(requestTO);
	
	if (Sequenced.indexOf(request_parsedTO)==-1){
		console.log('Secuenciado peticion');
		Sequenced.push(request_parsedTO);
		console.log('Sequenced[LocalSeq] ' + Sequenced[LocalSeq]);
		sendToReplicas(LocalSeq);
		LocalSeq=LocalSeq+1;
	}
	
});


//Cuando recibimos una peticion del cliente
handler_RR.on('message', function(request) {
	//Get the JSON send by a client.
  	var request_parsed = JSON.parse(request); 
  	
	//Si no existe 
	if (Sequenced.indexOf(request_parsed)==-1){
		console.log('Llamando a TO');
		handler_TO.send(request);
	}else{
		seq=Sequenced.indexOf(request_parsed);
		sendToReplicas(seq);
	}
});

//Desde las replicas
handler_FO.on('message', function(reply) {
	console.log('Recivida respuesta de la replica');
		reply = JSON.parse(reply);
		msg='recibido de FO';
		//HAY QUE COMPROBAR SI TIENE EL MISMO NUMERO DE SECUENCIA Y SI LO HEMOS RECIBIDO ANTES DE OTRA FO????????????????
		if(reply.seq==seq){
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
	console.log(Replicas[0]);
	if (seq>LastServerReq+1){
		for (let j=LastServerReq;j<seq;j++){
			req=Sequenced[j];
			for(let r=0;r<numberReplicas;r++){
				req.idReplica = Replicas[r];
				//console.log('Id de la replica: ' + Replicas[r]);
				handler_FO.send(JSON.stringify(req));
			}
		}
	}
	for(let r=0;r<numberReplicas;r++){
		req = Sequenced[seq];
		req.idReplica = Replicas[r];
		console.log('Id de la replica: ' + Replicas[r]);
		console.log('Enviando JSON ' + req);
		handler_FO.send(JSON.stringify(req));
	}
	LastServerReq=Math.max(LastServerReq, seq);
}

