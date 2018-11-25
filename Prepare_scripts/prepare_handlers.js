var zmq = require('zmq');
const fs = require('fs'); //File management
const fork = require('child_process').fork;

// Variables:
var handlers_childs = [];
var handler_prefix = 'handler';
var handler_prefix_TO = 'TO';
var handler_port_router_router_1= 4000; 
var handler_port_TO= 5000; 
var handler_port_router_router_2= 6000; 
var numhandlers = process.argv[2];
var periodoMatarProceso = process.argv[3]; //Periodo en el cual se va a ejecutar la función suicidio
var muerteDeHijos = process.argv[4]; //Si matamos hijos o no

// Check user input:
if (process.argv.length != 5) {
	//CHANGE
    console.log(process.argv.length);
    throw new Error('Incorrect number of parameters. Use: node prepare_handlers num_handlers\n');
}

//var portRouterRouter = process.argv[3];

// Write as much RRs ids as necessary (numRRs):
// specify the path to the file
let path_replicas = '../Files/replicas_ids.txt';


var replicas_data=[];
var Replicas=[];
var Replicas_Total=[];

fs.readFile(path_replicas,'utf8',function(err,data){
 replicas_data=data.split('\n');
 for (let i=0;i<replicas_data.length-1;i++){
     Replicas_Total=replicas_data[i].split(' ');
     Replicas.push(Replicas_Total[0]);
 }


    let path_handlers = '../Files/handlers_ids.txt';


    /******* RRS PREPARATION: *******/
    // Open the file in writing mode, adding a callback function where we do the actual writing

    fs.open(path_handlers, 'w+', function(err, fd) {  
        if (err) {
            throw 'could not open file path_handlers: ' + err;
        }

        var write_pos_init = 0;
        var write_pos_final = 0;
        for (let handler_idx = 0; handler_idx < numhandlers; handler_idx++) {    	
        	// Write the id of the new handler in a file:
        	var handler_id = handler_prefix + handler_idx;
        	write_pos_final = write_pos_final + handler_id.length;
        	fs.write(fd, handler_id, write_pos_init, write_pos_final, null, function(err) {
        		if (err) {
        			throw 'error writting handler_id in file: ' + err;
        		}
        	});
            //HAY QUE ESCRIBIR TAMBIÉN EL ID DEL SOCKET QUE CONECTA CON EL TO!!!!!!!!!
            write_pos_init = write_pos_final;
            var handler_id_TO = handler_prefix_TO + handler_idx;
            var handler_id_TO_txt = " " + handler_id_TO;
            write_pos_final = write_pos_init + handler_id_TO_txt.length;
            fs.write(fd, handler_id_TO_txt, write_pos_init, write_pos_final, null, function(err) {
                if (err) {
                    throw 'error writting handler_id_TO in file: ' + err;
                }
            });
        	write_pos_init = write_pos_final;
        	var handler_port_1 = handler_port_router_router_1 + handler_idx;
        	var handler_port_1_txt = " " + handler_port_1;
        	write_pos_final = write_pos_init + handler_port_1_txt.length;
        	fs.write(fd, handler_port_1_txt, write_pos_init, write_pos_final, null, function(err) {
        		if (err) {
        			throw 'error writting handler_port_1 in file: ' + err;
        		}
        	});
        	write_pos_init = write_pos_final;
        	var handler_port_2 = handler_port_router_router_2 + handler_idx;
        	var handler_port_2_txt = " " + handler_port_2 + "\n";
        	write_pos_final = write_pos_init + handler_port_2_txt.length;
        	fs.write(fd, handler_port_2_txt, write_pos_init, write_pos_final, null, function(err) {
        		if (err) {
        			throw 'error writting handler_port_2 in file: ' + err;
        		}
        	});
        	write_pos_init = write_pos_final;

        	// Initialize a child process running a handler with the given id:
        	handlers_childs.push(
    			//fork('RR', args = [RR_id + ' ' + RR_ip + ' ' + RR_port], options = {silent: false})
    			fork('../manejador', args = [handler_id + ' ' + 9001 + ' ' + handler_port_TO+ ' ' +9002+' '+handler_idx+' '+Replicas], options = {silent: false}) //current_RR[1] -> Port of this RR
    		);
        }  
        fs.close(fd, function(err) {
            if (err) {
                throw 'could not close file handlers_ids: ' + err;
            }
        });  
    });
});

//Cuando matamos al padre matamos también a los hijos
process.on('SIGINT', function(){
    for (let i = 0; i < handlers_childs.length; i++) {
        console.log('El pid de la Replica '+i+' es: '+handlers_childs[i].pid);
        process.kill(handlers_childs[i].pid);
    }
});

if (muerteDeHijos == "true"){
    //Muerte del proceso aleatoria
    var interval = setInterval(function suicidio(arg){
        console.log('Entra');
        var numeroProcesosDisponibles = handlers_childs.length;
        console.log("El numero de hijos es: "+numeroProcesosDisponibles);
        if (numeroProcesosDisponibles > 2 && decidirMatarHijo()){ //Mantemos siempre al menos 2 procesos VIVOS 
            pid = getPidAMatar();
            if (deleteProcessFromHandlersChild(pid)){
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
        var random_boolean = Math.random() >= 0.5;
        return random_boolean;
    }

    function getPidAMatar(){
        var item = handlers_childs[Math.floor(Math.random()*handlers_childs.length)];
        console.log('El proceso elegido es: '+item.pid);
        return item.pid;
    }

    function deleteProcessFromHandlersChild(pid){
        for (var i = 0; i < handlers_childs.length-1; i++){
            if (handlers_childs[i].pid == pid){
                handlers_childs.splice(i,1);
                return true;
            }
        }   
        return false;
    }
}
