const fs = require('fs');
var plotly = require('plotly')('Erburu', 'tnpOVllY8TisLYgMxfCr');

// Variables
var arrayTiempoMax = [];
var dataMax_X = [];
var dataMax_Y = [];

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
        // Tiempo máximo
		var maximoCliente = getMax(timesLine);
		arrayTiempoMax[i] = maximoCliente;
    }
    
	// Preparar datos para grafica
	for (let i = 0; i < arrayTiempoMax.length; i++){
        // Tiempo máximo
        dataMax_X[i] = i + 1;
		dataMax_Y[i] = arrayTiempoMax[i];
    }
    
    // Datos para pintar en los gráficos
    var dataMaximos = {
		x: dataMax_X,
		y: dataMax_Y,
		name: "Tiempo Máximo peticiones",
		//mode: "markers",
		type: "scatter"
	};

	// Preparar interfaz de grafica
	var layout = {
        title: "Gráfica Tiempo máximos ejecución de clientes",
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
			dtick: 0.02
		  }
	};
	
	var graphOptions = {layout: layout, filename: "Grafica Tiempos máximos de ejecución", fileopt: "overwrite"};
		plotly.plot(dataMaximos, graphOptions, function (err, msg) {
			console.log(msg);
    });
})

// Función para obtener tiempo máximo de peticiones de un cliente
function getMax(vector){
	var valoresTiempo = vector.split(',');
	var valor = 0;
	maximo = 0;
	for (let i = 0; i < valoresTiempo.length; i++){
		valor = parseFloat(valoresTiempo[i], 10);
		if (valor > maximo)
			maximo = valor;
	}
	return maximo;
}