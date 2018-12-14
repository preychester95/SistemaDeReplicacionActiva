const fs = require('fs'); //File management
const fork = require('child_process').fork;

// Variables:
var Replicas_childs = [];
var Replica_prefix = 'FO';
var Replica_port_base = 7000; 

var numReplicas = process.argv[2];
var periodoMatarProceso = process.argv[3]; //Periodo en el cual se va a ejecutar la función suicidio
var muerteDeHijos = process.argv[4]; //Si matamos hijos o no
//console.log("El parametro es: "+muerteDeHijos);
// Check user input:
if (process.argv.length != 5) {
    console.log(process.argv.length);
    throw new Error('Incorrect number of parameters. Use: node prepare_Replicas num_Replicas\n');
}


// Write as much Replicass ids as necessary (numReplicas):
// specify the path to the file
let path_Replicas = '../Files/replicas_ids.txt';

/******* Replicas PREPARATION: *******/
// Open the file in writing mode, adding a callback function where we do the actual writing

fs.open(path_Replicas, 'w+', function(err, fd) {  
    if (err) {
        throw 'could not open file Replicas_ids: ' + err;
    }
    var write_pos_init = 0;
    var write_pos_final = 0;
    for (let Replicas_idx = 0; Replicas_idx < numReplicas; Replicas_idx++) {    	
    	var Replica_id = Replica_prefix + Replicas_idx;
    	write_pos_final = write_pos_final + Replica_id.length;
    	fs.write(fd, Replica_id, write_pos_init, write_pos_final, null, function(err) {
    		if (err) {
    			throw 'error writting Replica_id in file: ' + err;
    		}
    	});
    	write_pos_init = write_pos_final;
    	var Replica_port = Replica_port_base + Replicas_idx;
    	var Replica_port_txt = " " + Replica_port + "\n";
    	write_pos_final = write_pos_init + Replica_port_txt.length;
    	fs.write(fd, Replica_port_txt, write_pos_init, write_pos_final, null, function(err) {
    		if (err) {
    			throw 'error writting Replica_port in file: ' + err;
    		}
    	});
    	write_pos_init = write_pos_final;

    	// Initialize a child process running a handler with the given id:
    	Replicas_childs.push(
			fork('../replica', args = [Replica_id + ' ' + 9003], options = {silent: false})
		);
    }  
    fs.close(fd, function(err) {
        if (err) {
            throw 'could not close file RRs_ids: ' + err;
        }
    });  
});

//Cuando matamos al padre matamos también a los hijos
process.on('SIGINT', function(){
    for (let i = 0; i < Replicas_childs.length; i++) {
         console.log('El pid de la Replica '+i+' es: '+Replicas_childs[i].pid);
         process.kill(Replicas_childs[i].pid);
     }
 });

if (muerteDeHijos == "true"){
    setTimeout(function() {
     //Muerte del proceso aleatoria
     var interval = setInterval(function suicidio(arg){
         console.log('Entra');
         var numeroProcesosDisponibles = Replicas_childs.length;
         console.log("El numero de hijos es: "+numeroProcesosDisponibles);
         if (numeroProcesosDisponibles > 2 && decidirMatarHijo()){ //Mantemos siempre al menos 2 procesos VIVOS 
             pid = getPidAMatar();
             if (deleteProcessFromReplicasChild(pid)){
                 console.log('Elemento eliminado del array con éxito!');
                 process.kill(pid);
                 console.log('Matamos al proceso: '+pid);
             }

         }
         else{
             console.log('No hay muertes');    
         } 
     },periodoMatarProceso);

     function decidirMatarHijo(){
         var random_boolean = Math.random() >= 0;
         return random_boolean;
     }

     function getPidAMatar(){
         var item = Replicas_childs[Math.floor(Math.random()*Replicas_childs.length)];
         console.log('El proceso elegido es: '+item.pid);
         return item.pid;
     }

     function deleteProcessFromReplicasChild(pid){
         for (var i = 0; i < Replicas_childs.length-1; i++){
             if (Replicas_childs[i].pid == pid){
                 Replicas_childs.splice(i,1);
                 return true;
             }
         }
         return false;
     }
      }, 4000);
 }