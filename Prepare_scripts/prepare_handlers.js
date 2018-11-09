var zmq = require('zmq');
const fs = require('fs'); //File management
const exec = require('child_process').exec;
const fork = require('child_process').fork;

// Variables:
var client_childs = [];
var handler_prefix = 'handler';
var handler_ip = '127.0.0.1';
var handler_port_base = 6000; //TEMP

// Check user input:
if (process.argv.length != 2 + 1) {
    console.log(process.argv.length);
    throw new Error('Incorrect number of parameters. Use: node prepare_handlers num_handlers\n');
}
var numHandlers = process.argv[2];

// A command to send to the client will be created randomly based in the following parameters:
possible_commands = ['help', 'get', 'set'];
possible_vars = ['a', 'b', 'c', 'd', 'e'];
possible_values = [1, 2, 3, 4, 5];

// Write as much handlers ids as necessary (numHandlers):
// specify the path to the file, and create a buffer with characters we want to write
let path = './Files/handlers_ids.txt';  

// HANDLERS PREPARATION:
// Open the file in writing mode, adding a callback function where we do the actual writing
fs.open(path, 'w+', function(err, fd) {  
    if (err) {
        throw 'could not open file: ' + err;
    }

    var write_pos_init = 0;
    var write_pos_final = 0;
    for (let handler_idx = 0; handler_idx < numHandlers; handler_idx++) {    	
    	// Write the id of the new handler in a file:
    	var handler_id = handler_prefix + handler_idx;
    	//var handler_id_buffer = new Buffer(handler_id); //Create the identifier to write in the File
    	write_pos_final = write_pos_final + handler_id.length;
    	fs.write(fd, handler_id, write_pos_init, write_pos_final, null, function(err) {
    		if (err) {
    			throw 'error writting handler_id in file: ' + err;
    		}
    	});
    	write_pos_init = write_pos_final;
    	var handler_port = handler_port_base + handler_idx;
    	var handler_port_txt = " " + handler_port + "\n";
    	//var handler_port_buffer = new Buffer(handler_port_txt);
    	write_pos_final = write_pos_init + handler_port_txt.length;
    	console.log(write_pos_init);
    	console.log(write_pos_final);
    	console.log(handler_port_txt);
    	fs.write(fd, handler_port_txt, write_pos_init, write_pos_final, null, function(err) {
    		if (err) {
    			throw 'error writting handler_port in file: ' + err;
    		}
    	});
    	write_pos_init = write_pos_final;
    	// Initialize a child process running a handler with the given id:
    	client_childs.push(
			fork('manejador', args = [handler_id + ' ' + handler_port], options = {silent: false})
		);
    }    
});


// HANDLERS EXECUTION SIMULATION:

/*fs.writeFile('./Files/handlers_ids.txt', 'utf-8', function(err) {
	if (err) throw err;
	var  lines = data.split('\n'); //Split the text by lines
	lines.forEach(function (line) {
		console.log(line);
		// handlers_childs.push(
		// 	exec('node test',
		// 		(error, stdout, stderr) => {
		// 			if (error) {
		// 				console.error('exec error: ' + error);
		// 				return;
		// 			}
		// 			console.log(stdout);
		// 			console.log('Created process for handler ' + line);
		// 		})
		// 	)
		
	})

	for (var i = 0; i < 10; i++) {
		client_childs.forEach(function (client) {
			if (client == null) {
				console.log('ups');
			}
			console.log('Writing help for client ' + client)
			client.send('help');
		})
	}
});*/

/*exec('manejador manejador.js',
	(error, stdout, stderr) => {
		console.log('${stdout}');
		console.log('${stderr}');
		if (error !== null) {
			console.log('exec error: ${error}');
		}
	});*/