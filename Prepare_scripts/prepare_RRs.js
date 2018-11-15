var zmq = require('zmq');
const fs = require('fs'); //File management
const fork = require('child_process').fork;

// Variables:
var RRs_childs = [];
var RR_prefix = 'RR';
var RR_port_base = 2000; 

// Check user input:
if (process.argv.length != 2 + 2) {
	//CHANGE
    console.log(process.argv.length);
    throw new Error('Incorrect number of parameters. Use: node prepare_RRs num_RRs portRouterRouter\n');
}
var numRRs = process.argv[2];
var portRouterRouter = process.argv[3];

// Write as much RRs ids as necessary (numRRs):
// specify the path to the file
let path_RRs = '../Files/RRs_ids.txt';
let path_handlers = '../Files/handlers_ids.txt';

/******* RRS PREPARATION: *******/
// Open the file in writing mode, adding a callback function where we do the actual writing

fs.readFile(path_handlers, 'utf8', function(err, data) {
    var handlers_data = data.split('\n');
    var handlers_ids = [];
    for (var i = 0; i < handlers_data.length - 1; i++) {
        var currentHandler = handlers_data[i].split(' ');
        handlers_ids.push(currentHandler[0]);
    }
    console.log(handlers_ids);
    fs.open(path_RRs, 'w+', function(err, fd) {  
        if (err) {
            throw 'could not open file RRs_ids: ' + err;
        }

        var write_pos_init = 0;
        var write_pos_final = 0;
        for (let RR_idx = 0; RR_idx < numRRs; RR_idx++) {    	
        	// Write the id of the new handler in a file:
        	var RR_id = RR_prefix + RR_idx;
        	write_pos_final = write_pos_final + RR_id.length;
        	fs.write(fd, RR_id, write_pos_init, write_pos_final, null, function(err) {
        		if (err) {
        			throw 'error writting RR_id in file: ' + err;
        		}
        	});
        	write_pos_init = write_pos_final;
        	var RR_port = RR_port_base + RR_idx;
        	var RR_port_txt = " " + RR_port + "\n";
        	write_pos_final = write_pos_init + RR_port_txt.length;
        	fs.write(fd, RR_port_txt, write_pos_init, write_pos_final, null, function(err) {
        		if (err) {
        			throw 'error writting handler_port in file: ' + err;
        		}
        	});
        	write_pos_init = write_pos_final;

        	// Initialize a child process running a handler with the given id:
        	RRs_childs.push(
    			//fork('RR', args = [RR_id + ' ' + RR_ip + ' ' + RR_port], options = {silent: false})
    			fork('../rr_module', args = [RR_id + ' ' + RR_port + ' ' + portRouterRouter + ' ' + handlers_ids], options = {silent: false}) //current_RR[1] -> Port of this RR
    		);
        }  
        fs.close(fd, function(err) {
            if (err) {
                throw 'could not close file RRs_ids: ' + err;
            }
        });  
    });
});

//Cuando matamos al padre matamos también a los hijos
process.on('exit', function(){
    for (let i = 0; i < RRs_childs.length; i++) {
        RRs_childs[i].kill();
    }
});