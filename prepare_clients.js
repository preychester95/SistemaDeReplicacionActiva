var zmq = require('zmq');
const fs = require('fs'); //File management
const exec = require('child_process').exec;
const fork = require('child_process').fork;

// Variables:
var client_childs = [];
var client_prefix = 'client';
var client_ip = '127.0.0.1';
var client_port_base = 3000; //TEMP

// A command to send to the client will be created randomly based in the following parameters:
possible_commands = ['help', 'get', 'set'];
possible_vars = ['a', 'b', 'c', 'd', 'e'];
possible_values = [1, 2, 3, 4, 5];

// Check user input:
if (process.argv.length != 2 + 1) {
	//CHANGE
    console.log(process.argv.length);
    throw new Error('Incorrect number of parameters. Use: node prepare_clients num_clients\n');
}
var numClients = process.argv[2];

// Write as much clients ids as necessary (numClients):
// specify the path to the file
let path_RRs = '../Files/RRs_ids.txt';
let path_clients = '../Files/clients_ids.txt';  

/******* CLIENTS PREPARATION: *******/
// Open the file in writing mode, adding a callback function where we do the actual writing
RRs_ids = [];
fs.readFile(path_RRs, 'utf8', function(err, data) {
	var RRs_data = data.split('\n');
})

fs.open(path_clients, 'w+', function(err, fd) {  
    if (err) {
        throw 'could not open file clients_ids: ' + err;
    }

    var write_pos_init = 0;
    var write_pos_final = 0;
    for (let client_idx = 0; client_idx < numHandlers; client_idx++) {    	
    	// Write the id of the new handler in a file:
    	var client_id = client_prefix + client_idx;
    	write_pos_final = write_pos_final + client_id.length;
    	fs.write(fd, client_id, write_pos_init, write_pos_final, null, function(err) {
    		if (err) {
    			throw 'error writting client_id in file: ' + err;
    		}
    	});
    	write_pos_init = write_pos_final;
    	var client_port = client_port_base + client_idx;
    	var client_port_txt = " " + client_port + "\n";
    	write_pos_final = write_pos_init + client_port_txt.length;
    	console.log(write_pos_init);
    	console.log(write_pos_final);
    	console.log(client_port_txt);
    	fs.write(fd, client_port_txt, write_pos_init, write_pos_final, null, function(err) {
    		if (err) {
    			throw 'error writting handler_port in file: ' + err;
    		}
    	});
    	write_pos_init = write_pos_final;
    	// Initialize a child process running a handler with the given id:
    	current_RR = RRs_data[client_idx].split(' ');
    	handler_childs.push(
			//fork('client', args = [client_id + ' ' + client_ip + ' ' + client_port], options = {silent: false})
			fork('client', args = [client_id + ' ' + current_RR[1] + ' ' + client_port], options = {silent: false}) //current_RR[1] -> Port of this RR
		);
    }    
});

fs.close(fd, function(err) {
    if (err) {
        throw 'could not close file clients_ids: ' + err;
    }
});

/******* CLIENTS EXECUTION SIMULATION: *******/

for (var i = 0; i < 10; i++) {
	client_childs.forEach(function (client) {
		if (client == null) {
			console.log('ups');
		}
		console.log('Writing help for client ' + client)
		client.send('help');
	})
}