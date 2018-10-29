var zmq = require('zmq');
const fs = require('fs'); //File management
const exec = require('child_process').exec;
const fork = require('child_process').fork;

// Variables:
var client_childs = [];

// A command to send to the client will be created randomly based in the following parameters:
possible_commands = ['help', 'get', 'set'];
possible_vars = ['a', 'b', 'c', 'd', 'e'];
possible_values = [1, 2, 3, 4, 5];

// read handlers ids from file:
fs.readFile('./Files/clients_ids.txt', 'utf-8', (err, data) => {
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
		client_childs.push(
			fork('client', args = line.split(' '), options = {silent: false})
		);
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
});

/*exec('manejador manejador.js',
	(error, stdout, stderr) => {
		console.log('${stdout}');
		console.log('${stderr}');
		if (error !== null) {
			console.log('exec error: ${error}');
		}
	});*/