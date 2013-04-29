var fs = require('fs');
var util = require('util');
var css = require('css');
var file = 'style.css';

Array.prototype.remove = function(a) {
    var what, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

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
var populationLength = 1;
var maxGenerations = 2;
var elites = 0;

var init = function(tree) {
	var stylesheet = tree;
	getFitness(stylesheet);

	// console.log(stylesheet);

	for (var i=0; i<populationLength; i++) {
		population.push(clone(stylesheet));
	}

	// console.log(population);

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
			// mutate(ss.s2);

			getFitness(ss.s1);
			// getFitness(ss.s2);

			newPopulation.push(ss.s1);
			// newPopulation.push(ss.s2);
		}

		population = newPopulation;
		sort();
		console.log('============');
		// console.log(population);
		console.log(util.inspect(population, false, null));
	}
};

var addElites = function(newPopulation) {
	for (var i=0; i<elites; i++) {
		newPopulation.push(clone(population[i]));
	}
};

var compare = function(a, b) {
	if (a.fitness > b.fitness)
		return -1;
	if (a.fitness < b.fitness)
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

var clone = function(a) {
	return JSON.parse(JSON.stringify(a));
};

var mutate = function(stylesheet) {
	if (Math.random() < 0.0) {
		mutateSplit(stylesheet);
	}
	else {
		mutateMerge(stylesheet);
	}
};

var mutateMerge = function(stylesheet) {
	var i1 = Math.floor(Math.random() * (stylesheet.rules.length));
	var i2 = Math.floor(Math.random() * (stylesheet.rules.length));
	var r1 = stylesheet.rules[i1];
	var r2 = stylesheet.rules[i2];

	if (r1 == r2) {
		return false;
	}

	var selectors1 = r1.selectors;
	var selectors2 = r2.selectors;
	var declarations1 = r1.declarations;
	var declarations2 = r2.declarations;

	console.log(selectors1);
	console.log(selectors2);

	var mayMerge = [];
	declarations2.forEach(function(d2){
		declarations1.forEach(function(d1){
			if (d1 === d2) {
				mayMerge.push(clone(d1));
			}
		});
	});

	console.log(mayMerge);
	if (mayMerge.length) {
		declarations1.remove(mayMerge);
		declarations2.remove(mayMerge);

		stylesheet.rules.push({
			'selectors': clone(selectors1).concat(clone(selectors2)),
			'declarations': clone(mayMerge)
		});
	}

	console.log(stylesheet);

};

var mutateSplit = function(stylesheet) {
	var i1 = Math.floor(Math.random() * (stylesheet.rules.length));
	var r1 = stylesheet.rules.splice(i1,1)[0];

	var selectors = r1.selectors;
	if (selectors.length > 1) {
		selectors.forEach(function(selector){
			var added = false;
			stylesheet.rules.forEach(function(rule){
				if ((rule.selectors.length == 1) && (rule.selectors[0] === selector)) {
					rule.declarations = rule.declarations.concat(clone(r1.declarations));
					added = true;
				}
			});
			if (!added) {
				stylesheet.rules.push({
					'selectors': [clone(selector)],
					'declarations': clone(r1.declarations)
				});
			}

		});
	}
	else {
		stylesheet.rules.push({
			'selectors': [clone(selectors[0])],
			'declarations': clone(r1.declarations)
		});
	}
};

var crossover = function(s1, s2) {

	return {
		's1': s1,
		's2': s2
	};
};

