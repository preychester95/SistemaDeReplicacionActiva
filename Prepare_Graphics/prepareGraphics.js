const fs = require('fs');
var plotly = require('plotly')('Erburu', 'tnpOVllY8TisLYgMxfCr');

// Variables
var arrayTiempoMedio = [];
var arrayTiempoMax = [];
var arrayTiempoAcumulado = [];
var dataMedias_X = [];
var dataMedias_Y = [];
var dataMax_X = [];
var dataMax_Y = [];
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
        // Tiempos medio
        var mediaCliente = getMedia(timesLine);
        arrayTiempoMedio[i] = mediaCliente;
        // Tiempo máximo
		var maximoCliente = getMax(timesLine);
		arrayTiempoMax[i] = maximoCliente;
        // Tiempo acumulado
        var acumuladoCliente = getAcumulado(timesLine);
		arrayTiempoAcumulado[i] = acumuladoCliente;
    }

	// Preparar datos para grafica
	for (let i = 0; i < arrayTiempoMedio.length; i++){
        // Tiempo medio
        dataMedias_X[i] = i + 1; 
		dataMedias_Y[i] = arrayTiempoMedio[i];
        // Tiempo máximo
        dataMax_X[i] = i + 1;
		dataMax_Y[i] = arrayTiempoMax[i];
        // Acumulado
        dataAcumulado_X[i] = i + 1;
		dataAcumulado_Y[i] = arrayTiempoAcumulado[i];
    }
    
    // Datos para pintar en los gráficos
    var dataMedias = {
		x: dataMedias_X,
		y: dataMedias_Y,
		name: "Tiempo Medio peticiones",
		type: "scatter"
    };
    var dataMaximos = {
		x: dataMax_X,
		y: dataMax_Y,
		name: "Tiempo Máximo peticiones",
		type: "scatter"
	};
	var dataAcumulados = {
		x: dataAcumulado_X,
		y: dataAcumulado_Y,
		name: "Tiempo Acumulado peticiones",
		type: "scatter"
	};
    
    var data = [dataMedias,dataMaximos,dataAcumulados];

	// Preparar interfaz de grafica
	var layout = {
        title: "Gráfica Tiempos ejecución de clientes",
        height:1500,
        width:1500,
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
            dtick: 0.05
		  }
	};
	
	var graphOptions = {layout: layout, filename: "Grafica Tiempos de ejecución", fileopt: "overwrite"};
		plotly.plot(data, graphOptions, function (err, msg) {
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

// Función para obtener tiempo acumulado de peticiones de un cliente
function getAcumulado(vector){
	var valoresTiempo = vector.split(',');
	var acumulado = 0;
	for (let i = 0; i < valoresTiempo.length; i++){
		acumulado = acumulado + parseFloat(valoresTiempo[i], 10);
	}
	return acumulado;
}