const fs = require('fs');
var plotly = require('plotly')('Erburu', 'tnpOVllY8TisLYgMxfCr');

// Variables
var arrayTiempoMedio = [];
var dataMedias_X = [];
var dataMedias_Y = [];

// Path fichero de tiempos
let path_timesFile = '../Files/ficheroTiempos.txt';

fs.readFile(path_timesFile,'utf8', function(err, data) {
	
	// Obtener lineas del fichero
	var lines = data.split('\n');
	
	// Preparar array de tiempos medios
	for (let i = 0; i < lines.length; i++){
		var mediaCliente = getMedia(lines[i]);
		arrayTiempoMedio[i] = mediaCliente;
	}
	
	// Preparar datos para grafica
	for (let i = 0; i < arrayTiempoMedio.length; i++){
		dataMedias_X[i] = i + 1; 
		dataMedias_Y[i] = arrayTiempoMedio[i];
	}
	var dataMedias = {
		x: dataMedias_X,
		y: dataMedias_Y,
		name: "Tiempo Medio",
		type: "scatter"
	};
	
	// Preparar interfaz de grafica
	var layout = {
		title: "Gráfica Tiempos Medios",
		xaxis: {
			title: "Numero clientes",
			titlefont: {
			  family: "Courier New, monospace",
			  size: 18,
			  color: "#7f7f7f"
			}
		  },
		yaxis: {
			title: "Tiempo medios peticiones",
			titlefont: {
			  family: "Courier New, monospace",
			  size: 18,
			  color: "#7f7f7f"
			}
		  }
	};
	
	// Pintar la grafica
	var graphOptions = {layout: layout, filename: "Grafica Tiempos Medios", fileopt: "overwrite"};
		plotly.plot(dataMedias, graphOptions, function (err, msg) {
			console.log(msg);
	});
})

// Función para obtener tiempo medio de peticiones de un cliente
function getMedia(vector){
	var valoresTiempo = vector.split(' ');
	var acumulado = 0;
	var elementos = 0;
	for (let i = 0; i < valoresTiempo.length; i++){
		acumulado = acumulado + parseFloat(valoresTiempo[i], 10);
		elementos = elementos + 1;
	}
	return acumulado/elementos;
}

	
	
	
