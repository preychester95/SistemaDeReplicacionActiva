var zmq = require('zmq');
var handler_RR = zmq.socket('dealer');
var handler_FO= zmq.socket('dealer');
var handler_TO=zmq.socket('push');

//Ultima peticion servida
var LastServerReq=0;
//Numero de secuencia
var seq;
//Variables del sequenciador
//Hay que ver cual de las dos siguentes funciona
//En el array sequenced se guarda el json
var Sequenced={}
var Requests={}
var Replicas=['RR_1','RR_2','RR_3'];

var LocalSeq=1;
var UltimaReq=0;

/*function getSeq(requestARH){
		i=0;
		while(Sequenced[i].id!=requestARH.id){
			i=i+1;
		}
		if(Sequenced[i].id!=requestARH.id){
			handler_TO.send(JSON.stringify(requestARH));	
			Requests[UltimaReq]=JSON.parse(requestARH);		
		}else{
			return i;
		}
}*/

/*function getReq(j){
	return Sequenced[j];
}*/

//RR
var portRR = process.argv[2];
//Replicas
var portFO= process.argv[3];
//TO
var portTO=process.argv[4];

handler_RR.bind('tcp://*:' + portRR);
handler_FO.bind('tcp://*:' + portFO);
handler_TO.bind('tcp://*'+ portTO);
numberReplicas=Replicas.length;
console.log('Esperando...');

//Cuando nos devuelve el TO
handler_TO.on('message',function(requestTO){
	//Get the JSON send by a TO
  	var request_parsedTO = JSON.parse(requestTO);
  	var request_id=request_parsedTO.idClient; 
	/*i=0;
	while(Sequenced[i]!=requestTO){
		i=i+1;
	}*/
	if (Sequenced.indexOf(request_parsedTO)==-1){
		Sequenced[LocalSeq]=requestTO;
		LocalSeq=LocalSeq+1;

	}

	/*j=0;
	while(requestARH[j].idClient!=request_id){
		j=j+1;
	}
	if(requestARH[j].idClient==request_id){
		
	}*/
	
});


//Cuando recibimos una peticion del cliente
handler_RR.on('message', function(request) {
	//Get the JSON send by a client.
  	var request_parsed = JSON.parse(request); 
  	var request_id=request_parsed.idClient; 
  	var request_op=request_parsed.msg.op;
  	var request_arg=request_parsed.msg.arg;

  	//Codigo manejador

  //	i=0;
	//while(Sequenced[i].id!=requestARH.id){
	//	i=i+1;
	//}
	//Si no existe 
	if (Sequenced.indexOf(request_parsed)==-1){
		handler_TO.send(request);

	}else{
		seq=Sequenced.indexOf(request_parsed);
	}
	/*if(Sequenced[i].id!=requestARH.id){
		handler_TO.send(JSON.stringify(requestARH));	
		Requests[UltimaReq]=JSON.parse(requestARH);		
	}else{
		return i;
	}*/

	//seq=getSeq(request_id);
	if (seq>LastServerReq+1){
		for (let j=LastServerReq;j<seq;j++){
			//req=getReq(j);
			req=Sequenced[j];
			for(let r=1;r<numberReplicas;r++){
				handler_FO.send(r,j,req);
			}
		}
	}
	for(let r=1;r<numberReplicas;r++){
		handler_FO.send(r,seq,req);
	}
	LastServerReq=Math.max(LastServerReq,seq);
});

//Desde las replicas
handler_FO.on('message', function(reply) {
		reply = JSON.parse(reply);
		msg='recibido de FO';
		//HAY QUE COMPROBAR SI TIENE EL MISMO NUMERO DE SECUENCIA Y SI LO HEMOS RECIBIDO ANTES DE OTRA FO????????????????
		if(reply.seq==seq){
			handler_RR.send(reply,msg);

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



