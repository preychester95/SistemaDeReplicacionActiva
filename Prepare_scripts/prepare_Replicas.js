const fs = require('fs'); //File management
const fork = require('child_process').fork;

// Variables:
var Replicas_childs = [];
var Replica_prefix = 'FO';
var Replica_port_base = 7000; 

// Check user input:
if (process.argv.length != 2 + 1) {
    console.log(process.argv.length);
    throw new Error('Incorrect number of parameters. Use: node prepare_Replicas num_Replicas\n');
}
var numReplicas = process.argv[2];

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
			fork('../replica', args = [Replica_id + ' ' + Replica_port], options = {silent: false})
		);
    }  
    fs.close(fd, function(err) {
        if (err) {
            throw 'could not close file RRs_ids: ' + err;
        }
    });  
});