var zmq = require('zmq');
const fs = require('fs'); //File management
const exec = require('child_process').exec;
const fork = require('child_process').fork;

// Variables:
var client_childs = [];
var client_prefix = 'client';
var cont=0;

// A command to send to the client will be created randomly based in the following parameters:
possible_commands = ['get', 'set'];
possible_vars = ['a', 'b', 'c', 'd', 'e'];
possible_values = [1, 2, 3, 4, 5];
var numeroPeticiones=process.argv[2];
var periodoMatarProceso = process.argv[3]; //Periodo en el cual se va a ejecutar la función suicidio
var muerteDeHijos = process.argv[4]; //Si matamos hijos o no

// Check user input:
if (process.argv.length != 5) {
	//CHANGE
    throw new Error('Incorrect number of parameters. Use: node prepare_clients numeroPeticiones\n');
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
        console.log('El hijo '+i+' se conectara al modulo RR en el puerto '+current_RR[1]);
        client_childs.push(
            fork('../client_process', args = [client_id + ' ' + current_RR[1]+ ' '+numeroPeticiones], options = {silent: false}) //current_RR[1] -> Port of this RR
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

    for (var i = 0; i < numeroPeticiones; i++) {
        client_childs.forEach(function (client) {
            sendRandomRequest(client);
        });
    }
    client_childs.forEach(function (client) {
            console.log(client);
            client.on('message', function(response) {
                console.log('Recibido mensaje de hijo: '+response);

            path_informes='../Files/informe.txt';
            fs.open(path_informes, 'as', function(err, fd) {  
                if (err) {
                    throw 'could not open file path_handlers: ' + err;
                }
                var write_pos_init = 0;
                var write_pos_final = 0;
               // client_childs.forEach(function (client) {
                    var client_id = 'cliente'+cont;
                    write_pos_final = write_pos_final + client_id.length;
                    fs.write(fd, client_id, write_pos_init, write_pos_final, null, function(err) {
                            if (err) {
                                throw 'error writting informes_id in file: ' + err;
                            }
                    });
                    write_pos_init = write_pos_final;
                    var tiempo=response;
                    var tiempo_txt=": "+tiempo+"\n";
                    write_pos_final = write_pos_final + tiempo_txt.length;
                    fs.write(fd, tiempo_txt, write_pos_init, write_pos_final, null, function(err) {
                           if (err) {
                               throw 'error writting informes_id in file: ' + err;
                           }
                    });
                    write_pos_init = write_pos_final;
                    cont=cont+1;
                //});
            fs.close(fd, function(err) {
                    if (err) {
                        throw 'could not close file handlers_ids: ' + err;
                    }
            });
            });
    });
});
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
    }
}



//Cuando matamos al padre matamos también a los hijos
process.on('SIGINT', function(){
    for (let i = 0; i < client_childs.length; i++) {
        console.log('El pid de la Replica '+i+' es: '+client_childs[i].pid);
        process.kill(client_childs[i].pid);
    }
});

if (muerteDeHijos == "true"){
    //Muerte del proceso aleatoria
    var interval = setInterval(function suicidio(arg){
        console.log('Entra');
        var numeroProcesosDisponibles = client_childs.length;
        console.log("El numero de hijos es: "+numeroProcesosDisponibles);
        if (numeroProcesosDisponibles > 2 && decidirMatarHijo()){ //Mantemos siempre al menos 2 procesos VIVOS 
            pid = getPidAMatar();
            if (deleteProcessFromClientsChild(pid)){
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
        var item = client_childs[Math.floor(Math.random()*client_childs.length)];
        console.log('El proceso elegido es: '+item.pid);
        return item.pid;
    }

    function deleteProcessFromClientsChild(pid){
        for (var i = 0; i < client_childs.length-1; i++){
            if (client_childs[i].pid == pid){
                client_childs.splice(i,1);
                return true;
            }
        }
        return false;
    }
}
