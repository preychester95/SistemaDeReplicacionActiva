const fs = require('fs');
var plotly = require('plotly')('Erburu', 'tnpOVllY8TisLYgMxfCr');

// Variables
var arrayTiempoMedio = [];
var dataMedias_X = [];
var dataMedias_Y = [];

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
        // Tiempos medio
        var mediaCliente = getMedia(timesLine);
        arrayTiempoMedio[i] = mediaCliente;
    }
    
	// Preparar datos para grafica
	for (let i = 0; i < arrayTiempoMedio.length; i++){
        // Tiempo medio
        dataMedias_X[i] = i + 1; 
		dataMedias_Y[i] = arrayTiempoMedio[i];
    }
    
    // Datos para pintar en los gráficos
    var dataMedias = {
		x: dataMedias_X,
		y: dataMedias_Y,
		name: "Tiempo Medio peticiones",
		type: "scatter"
    };

	// Preparar interfaz de grafica
	var layout = {
		title: "Gráfica Tiempo medio ejecución de clientes",
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
			title: "Tiempos de ejecución",
			titlefont: {
			  family: "Courier New, monospace",
			  size: 18,
			  color: "#7f7f7f"
			},
			tick0: 0,
			dtick: 0.002
		  }
	};
	
	var graphOptions = {layout: layout, filename: "Grafica Tiempos medios de ejecución", fileopt: "overwrite"};
		plotly.plot(dataMedias, graphOptions, function (err, msg) {
			console.log(msg);
    });
})

// Función para obtener tiempo medio de peticiones de un cliente
function getMedia(vector){
	var valoresTiempo = vector.split(',');
	var acumulado = 0;
	var elementos = 0;
	for (let i = 0; i < valoresTiempo.length; i++){
		acumulado = acumulado + parseFloat(valoresTiempo[i], 10);
		elementos = elementos + 1;
	}
	return acumulado/elementos;
}