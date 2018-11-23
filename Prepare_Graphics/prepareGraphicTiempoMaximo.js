
const fs = require('fs');
var plotly = require('plotly')('Erburu', 'tnpOVllY8TisLYgMxfCr');

// Variables
var arrayTiempoMax = [];
var dataMax_X = [];
var dataMax_Y = [];

// Path fichero de tiempos
let path_timesFile = '../Files/ficheroTiempos.txt';

fs.readFile(path_timesFile,'utf8', function(err, data) {
	
	// Obtener lineas del fichero
	var lines = data.split('\n');
	
	// Preparar array de tiempos maximos
	for (let i = 0; i < lines.length; i++){
		var maximoCliente = getMax(lines[i]);
		arrayTiempoMax[i] = maximoCliente;
	}

	// Preparar datos para grafica
	for (let i = 0; i < arrayTiempoMax.length; i++){
		dataMax_X[i] = i + 1;
		dataMax_Y[i] = arrayTiempoMax[i];
	}
	var dataMaximos = {
		x: dataMax_X,
		y: dataMax_Y,
		name: "Tiempo Maximo",
		type: "scatter"
	};
	
	// Preparar interfaz de grafica
	var layout = {
		title: "Gráfica Tiempos Máximos",
		xaxis: {
			title: "Numero clientes",
			titlefont: {
			  family: "Courier New, monospace",
			  size: 18,
			  color: "#7f7f7f"
			}
		  },
		yaxis: {
			title: "Tiempo máximo peticiones",
			titlefont: {
			  family: "Courier New, monospace",
			  size: 18,
			  color: "#7f7f7f"
			}
		  }
	};
	
	var graphOptions = {layout: layout, filename: "Grafica Tiempos Máximos", fileopt: "overwrite"};
		plotly.plot(dataMaximos, graphOptions, function (err, msg) {
			console.log(msg);
	});
})

// Función para obtener tiempo máximo de peticiones de un cliente
function getMax(vector){
	var valoresTiempo = vector.split(' ');
	var valor = 0;
	maximo = 0;
	for (let i = 0; i < valoresTiempo.length; i++){
		valor = parseFloat(valoresTiempo[i], 10);
		if (valor > maximo)
			maximo = valor;
	}
	return maximo;
}
	
	
	
