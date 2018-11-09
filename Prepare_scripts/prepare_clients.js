var zmq = require('zmq');
const fs = require('fs'); //File management
const exec = require('child_process').exec;
const fork = require('child_process').fork;

// Variables:
var client_childs = [];
var client_prefix = 'client';

// A command to send to the client will be created randomly based in the following parameters:
possible_commands = ['help', 'get', 'set'];
possible_vars = ['a', 'b', 'c', 'd', 'e'];
possible_values = [1, 2, 3, 4, 5];

// Check user input:
if (process.argv.length != 2) {
	//CHANGE
    throw new Error('Incorrect number of parameters. Use: node prepare_clients\n');
}

// Write as much clients ids as necessary (numClients):
// specify the path to the file
let path_RRs = '../Files/RRs_ids.txt';
let path_clients = '../Files/clients_ids.txt';  

/******* CLIENTS PREPARATION: *******/
// Open the file in writing mode, adding a callback function where we do the actual writing
RRs_data = [];
fs.readFile(path_RRs, 'utf8', function(err, data) {
    RRs_data = data.split('\n');

    for (var i = 0; i < RRs_data.length - 1; i++) {
        var client_id = client_prefix + i;

        current_RR = RRs_data[i].split(' ');
        console.log(current_RR[1]);
        client_childs.push(
            fork('../client_process', args = [client_id + ' ' + current_RR[1]], options = {silent: false}) //current_RR[1] -> Port of this RR
        );
        console.log('Creado hijo ' + i);
    }

    /******* CLIENTS EXECUTION SIMULATION: *******/
    // for (var i = 0; i < 10; i++) {
    //     console.log('Iteracion numero ' + i);
    //     client_childs.forEach(function (client) {
    //         if (client == null) {
    //             console.log('ups');
    //         }
    //         console.log('Writing help for client ' + client)
    //         client.send('help');
    //     })
    // }

    for (var i = 0; i < 10; i++) {
        client_childs.forEach(function (client) {
            sendRandomRequest(client);
        });
    }
});

function sendRandomRequest(client) {
    var commandIdx = Math.floor(Math.random() * possible_commands.length); //Choose a random index from your used handlerList
    var chosenCommand = possible_commands[commandIdx];
    if (chosenCommand == 'get') {
        var variableIdx = Math.floor(Math.random() * possible_vars.length);
        var chosenVar = possible_vars[variableIdx];
        client.send(chosenCommand + ' ' + chosenVar);
    } else if (chosenCommand == 'set') {
        var variableIdx = Math.floor(Math.random() * possible_vars.length);
        var chosenVar = possible_vars[variableIdx];
        var valueIdx = Math.floor(Math.random() * possible_values.length);
        var chosenValue = possible_values[valueIdx];
        client.send(chosenCommand + ' ' + chosenVar + ' ' + chosenValue);
    } else if (chosenCommand == 'help') {
        client.send('help');
    }
}