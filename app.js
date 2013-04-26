var fs = require('fs');
var util = require('util');
var css = require('css');

var file = 'style.css';



var parseCSS = function(tree){

	var stylesheet = {};
	stylesheet.rules = [];
	stylesheet.fitness = Infinity;

	tree.stylesheet.rules.forEach(function(rule){
		var r = {};
		r.selectors = rule.selectors;
		var d = [];
		rule.declarations && rule.declarations.forEach(function(declaration){
			d.push(declaration.property + ':' + declaration.value + ';');
		});
		r.declarations = d;

		rule.selectors && rule.declarations && stylesheet.rules.push(r);
	});

	return stylesheet;
};

fs.readFile(file, function (err, data) {
	if (err) throw err;
	var cssString = data.toString();

	// console.log(util.inspect(css.parse(cssString), false, null));

	init(parseCSS(css.parse(cssString)));
	minify();
});

var population = [];
var populationLength = 50;
var maxGenerations = 1000;

var init = function(tree) {
	var stylesheet = tree;
	stylesheet.fitness = getFitness(stylesheet.rules);

	console.log(stylesheet);

	for (var i=0; i<populationLength; i++){
		population.push(clone(stylesheet));
	}

	console.log(population);

};

var minify = function(){
	var g = 0;
	while (g < maxGenerations) {
		g++;

		var newPopulation = [];
		while (newPopulation.length < populationLength) {
			var stylesheet = tournament();
			mutate(stylesheet);
			newPopulation.push(stylesheet);
		}
	}
};

var tournament = function(){
	var i1 = Math.floor(Math.random() * (populationLength));
	var i2 = Math.floor(Math.random() * (populationLength));

	if (population[i1].fitness > population[i2].fitness) {
		return clone(population[i1]);
	}
	else {
		return clone(population[i2]);
	}
};

var getFitness = function(rules){
	var fitness = Infinity;
	var s = 0;
	var d = 0;
	rules.forEach(function(rule){
		s += rule.selectors.length;
	});
	rules.forEach(function(rule){
		d += rule.declarations.length;
	});

	fitness = 100 / ( 0.5 * s + d );
	return fitness;
};

var clone = function(stylesheet) {
	return JSON.parse(JSON.stringify(stylesheet));
};

var mutate = function(stylesheet){
	if (Math.random() < 0.5){
		mutateSplit();
	}
	else {
		mutateMerge();
	}

	getFitness(stylesheet.rules);
};

var mutateMerge = function(){

};

var mutateSplit = function(){

};

var crossover = function(){

};

