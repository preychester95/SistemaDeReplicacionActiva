var zmq = require('zmq');
const fs = require('fs'); //File management
const fork = require('child_process').fork;

// Variables:
var handlers_childs = [];
var handler_prefix = 'handler';
var handler_port_router_router_1= 4000; 
var handler_port_TO= 5000; 
var handler_port_router_router_2= 6000; 

// Check user input:
if (process.argv.length != 3) {
	//CHANGE
    console.log(process.argv.length);
    throw new Error('Incorrect number of parameters. Use: node prepare_handlers num_handlers\n');
}
var numhandlers = process.argv[2];
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
        	write_pos_init = write_pos_final;
        	var handler_port_1 = handler_port_router_router_1 + handler_idx;
        	var handler_port_1_txt = " " + handler_port_1 + "\n";
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
    			fork('../manejador', args = [handler_id + ' ' + handler_port_1 + ' ' + handler_port_TO+' '+handler_port_2+' '+Replicas], options = {silent: false}) //current_RR[1] -> Port of this RR
    		);
        }  
        fs.close(fd, function(err) {
            if (err) {
                throw 'could not close file handlers_ids: ' + err;
            }
        });  
    });
});