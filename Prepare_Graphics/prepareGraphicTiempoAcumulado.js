const fs = require('fs');
var plotly = require('plotly')('Erburu', 'tnpOVllY8TisLYgMxfCr');

// Variables
var arrayTiempoAcumulado = [];
var dataAcumulado_X = [];
var dataAcumulado_Y = [];

// Path fichero de tiempos
let path_timesFile = '../Files/informe.txt';

fs.readFile(path_timesFile,'utf8', function(err, data) {
	
	// Obtener lineas del fichero
    var lines = data.split('\n');
	// Preparar array de tiempos 
	for (let i = 0; i < lines.length - 1; i++){
        index = lines[i].indexOf(':');
        // Se obtiene la parte de los tiempos de cada cliente
        var timesLine = lines[i].slice(index+1,lines[i].length);
        // Tiempo acumulado
        var acumuladoCliente = getAcumulado(timesLine);
		arrayTiempoAcumulado[i] = acumuladoCliente;
    }
    
	// Preparar datos para grafica
	for (let i = 0; i < arrayTiempoAcumulado.length; i++){
        // Acumulado
        dataAcumulado_X[i] = i + 1;
		dataAcumulado_Y[i] = arrayTiempoAcumulado[i];
    }
    
	var dataAcumulados = {
		x: dataAcumulado_X,
		y: dataAcumulado_Y,
		name: "Tiempo Acumulado peticiones",
		//mode: "markers",
		type: "scatter",
	};

	// Preparar interfaz de grafica
	var layout = {
        title: "Gráfica Tiempo acumulado ejecución de clientes",
		xaxis: {
			title: "Clientes",
			titlefont: {
			  family: "Courier New, monospace",
			  size: 18,
			  color: "#7f7f7f"
			},
			tick0: 0,
            dtick: 1
		  },
		yaxis: {
			title: "Tiempos de ejecución (seg)",
			titlefont: {
			  family: "Courier New, monospace",
			  size: 18,
			  color: "#7f7f7f"
			},
			tick0: 0,
			dtick: 0.05
		  }
	};
	
	var graphOptions = {layout: layout, filename: "Grafica Tiempos acumulados de ejecución", fileopt: "overwrite"};
		plotly.plot(dataAcumulados, graphOptions, function (err, msg) {
			console.log(msg);
    });
})

// Función para obtener tiempo acumulado de peticiones de un cliente
function getAcumulado(vector){
	var valoresTiempo = vector.split(',');
	var acumulado = 0;
	for (let i = 0; i < valoresTiempo.length; i++){
		acumulado = acumulado + parseFloat(valoresTiempo[i], 10);
	}
	return acumulado;
}