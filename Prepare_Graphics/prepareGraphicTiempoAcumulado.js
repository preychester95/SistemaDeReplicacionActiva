const fs = require('fs');
var plotly = require('plotly')('Erburu', 'tnpOVllY8TisLYgMxfCr');

// Variables
var arrayTiempoAcumulado = [];
var dataAcumulado_X = [];
var dataAcumulado_Y = [];

// Path fichero de tiempos
let path_timesFile = '../Files/ficheroTiempos.txt';

fs.readFile(path_timesFile,'utf8', function(err, data) {
	
	// Obtener lineas del fichero
	var lines = data.split('\n');
	
	// Preparar array de tiempos maximos
	for (let i = 0; i < lines.length; i++){
		var acumuladoCliente = getAcumulado(lines[i]);
		arrayTiempoAcumulado[i] = acumuladoCliente;
	}

	// Preparar datos para grafica
	for (let i = 0; i < arrayTiempoAcumulado.length; i++){
		dataAcumulado_X[i] = i + 1;
		dataAcumulado_Y[i] = arrayTiempoAcumulado[i];
	}
	var dataAcumulados = {
		x: dataAcumulado_X,
		y: dataAcumulado_Y,
		name: "Tiempo Acumulado",
		type: "scatter"
	};
	
	// Preparar interfaz de grafica
	var layout = {
		title: "Gráfica Tiempos Acumulados",
		xaxis: {
			title: "Numero clientes",
			titlefont: {
			  family: "Courier New, monospace",
			  size: 18,
			  color: "#7f7f7f"
			}
		  },
		yaxis: {
			title: "Tiempo acumulado peticiones",
			titlefont: {
			  family: "Courier New, monospace",
			  size: 18,
			  color: "#7f7f7f"
			}
		  }
	};
	
	var graphOptions = {layout: layout, filename: "Grafica Tiempos Acumulados", fileopt: "overwrite"};
		plotly.plot(dataAcumulados, graphOptions, function (err, msg) {
			console.log(msg);
	});
})

function getAcumulado(vector){
	var valoresTiempo = vector.split(' ');
	var acumulado = 0;
	for (let i = 0; i < valoresTiempo.length; i++){
		acumulado = acumulado + parseFloat(valoresTiempo[i], 10);
	}
	return acumulado;
}
	
	
	
