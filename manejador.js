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
//EN EL ARRAY SEQUENCED SE GUARDAN LOS ID'S DE LAS PETICIONES????
var Sequenced=new Array();
var Sequenced=[];
var LocalSeq=1;

function getSeq(requestARH){
		i=1;
		while(Sequenced[i]!=requestARH){
			i=i+1;
		}
		if(Sequenced[i]!=requestARH){
			handler_TO.send(requestARH);
		}else{
			return i;
		}
}
function getReq(j){
	return Sequenced[j];
}
//RR
var portRR = process.argv[2];
//Replicas
var portFO= process.argv[3];
//TO
var portTO=process.argv[4];

handler_RR.bind('tcp://*:' + portRR);
handler_FO.bind('tcp://*:' + portFO);
handler_TO.bind('tcp://*'+ portTO);
console.log('Esperando...');

//Cuando nos devuelve el TO
handler_TO.on('message',function(requestTO){
	//Get the JSON send by a TO
  	var request_parsedTO = JSON.parse(requestTO); 
	i=1;
	while(Sequenced[i]!=requestTO){
		i=i+1;
	}
	if(Sequenced[i]!=requestTO){
		Sequenced[LocalSeq]=requestTO;
		LocalSeq=LocalSeq+1;
	}
	if(requestTO=requestARH){
		//DEVOLVER AL getSeq el valor de la posicion???????????????????''
	}
});


//Cuando recibimos una peticion del cliente
handler_RR.on('message', function(request) {
	//Get the JSON send by a client.
  	var request_parsed = JSON.parse(request); 
	//Se le pasa la peticion. HAY QUE PASARLE TODA ENTERA?????
	seq=getSeq(request);
	if (seq>LastServerReq+1){
		for (let j=LastServerReq;j<seq;j++){
			req=getReq(j);
			//COMO SABEMOS EL NUMERO DE REPLICAS?????
			for(let r=1;r<numberReplicas;r++){
				handler_FO.send(r,j,request);
			}
		}
	}
	for(let r=1;r<numberReplicas;r++){
		request = JSON.parse(request);
		seq = JSON.parse(seq);
		handler_FO.send(r,seq,request);
	}
	LastServerReq=Math.max(LastServerReq,seq);
});

//Desde las replicas
handler_FO.on('message', function(reply) {
		reply = JSON.parse(reply);
		msg='recibido de FO';
		//HAY QUE COMPROBAR SI TIENE EL MISMO NUMERO DE SECUENCIA Y SI LO HEMOS RECIBIDO ANTES DE OTRA FO????????????????
		i=1;
		while(Sequenced[i]!=reply){
			i=i+1;
		}
		if(Sequenced[i]!=reply){
		}
		else{
			if (reply=LastServerReq){
				handler_RR.send(reply,msg);
			}
		}
});



