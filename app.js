var fs = require('fs');
var util = require('util');
var css = require('css');

var file = 'style.css';



var parseCSS = function(tree) {

	var stylesheet = {};
	stylesheet.rules = [];
	stylesheet.fitness = Infinity;

	tree.stylesheet.rules.forEach(function(rule) {
		var r = {};
		r.selectors = rule.selectors;
		var d = [];
		rule.declarations && rule.declarations.forEach(function(declaration) {
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
var elites = 2;

var init = function(tree) {
	var stylesheet = tree;
	getFitness(stylesheet);

	console.log(stylesheet);

	for (var i=0; i<populationLength; i++) {
		population.push(clone(stylesheet));
	}

	console.log(population);

};

var minify = function() {
	var g = 0;
	sort();

	while (g < maxGenerations) {
		g++;

		var newPopulation = [];
		addElites(newPopulation);

		while (newPopulation.length < populationLength) {
			var ss = crossover(tournament(), tournament());
			mutate(ss.s1);
			mutate(ss.s2);

			getFitness(ss.s1);
			getFitness(ss.s2);

			newPopulation.push(ss.s1);
			newPopulation.push(ss.s2);
		}

		sort();
	}
};

var addElites = function(newPopulation) {
	for (var i=0; i<elites; i++) {
		newPopulation.push(clone(population[i]));
	}
};

var compare = function(a, b) {
	if (a.fitness < b.fitness)
		return -1;
	if (a.fitness > b.fitness)
		return 1;
	return 0;
};

var sort = function() {
	population.sort(compare);
};

var tournament = function() {
	var i1 = Math.floor(Math.random() * (populationLength));
	var i2 = Math.floor(Math.random() * (populationLength));

	if (population[i1].fitness > population[i2].fitness) {
		return clone(population[i1]);
	}
	else {
		return clone(population[i2]);
	}
};

var getFitness = function(stylesheet) {
	var fitness = Infinity;
	var s = 0;
	var d = 0;
	stylesheet.rules.forEach(function(rule) {
		s += rule.selectors.length;
	});
	stylesheet.rules.forEach(function(rule) {
		d += rule.declarations.length;
	});

	stylesheet.fitness = 100 / ( 0.5 * s + d );
};

var clone = function(stylesheet) {
	return JSON.parse(JSON.stringify(stylesheet));
};

var mutate = function(stylesheet) {
	if (Math.random() < 0.3) {
		mutateSplit(stylesheet);
	}
	else {
		mutateMerge(stylesheet);
	}
};

var mutateMerge = function(stylesheet) {

};

var mutateSplit = function(stylesheet) {

};

var crossover = function(s1, s2) {
	return {
		's1': s1,
		's2': s2
	};
};

