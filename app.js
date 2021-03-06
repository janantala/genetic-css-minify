var fs = require('fs');
var Q = require('q');
var util = require('util');
var css = require('css');

var minFile;

/*
	Genetic CSS minify
	run: $ node app.js your/css/file.css

	@options.populationLength: total number of stylesheets in one population
	@options.maxGenerations: maximum generations of algorithm
	@options.roundOut: maximum generations without fitness improvement
	@options.mutateLine: line between mutateSplit <0,options.mutateLine) and mutateMerge <options.mutateLine,1)
	@options.crossover: crossover propability
	@options.elites: number of options.elites which are automaticaly passed into a new generation
	@options.selection: options.selection method - 'tournament' or 'roulllete'
 */

var options = {
	populationLength: 50,
	maxGenerations: 10000,
	roundOut: 1000,
	mutateLine: 0.2,
	crossover: 0,
	elites: 2,
	selection: 'tournament'
};

var population = [];
var cssSize = 0;

/*
	general functions
 */

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

Array.prototype.unique = function() {
	var a = this.concat();
	for (var i=0; i<a.length; ++i) {
		for (var j=i+1; j<a.length; ++j) {
			if (a[i] === a[j])
			a.splice(j--, 1);
		}
	}
	return a;
};

var clone = function(a) {
	return JSON.parse(JSON.stringify(a));
};

var checkArrays = function( arrA, arrB ){

	if (arrA.length !== arrB.length) return false;

	var cA = arrA.slice().sort();
	var cB = arrB.slice().sort();

	for(var i=0; i<cA.length; i++){
		if(cA[i] !== cB[i]) return false;
	}

	return true;
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

		rule.selectors && rule.declarations && rule.declarations.length && stylesheet.rules.push(r);
	});

	return stylesheet;
};

/*
	genetic functions
 */

var addElites = function(newPopulation) {
	for (var i=0; i<options.elites; i++) {
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
	var i1 = Math.floor(Math.random() * (options.populationLength));
	var i2 = Math.floor(Math.random() * (options.populationLength));

	if (population[i1].fitness > population[i2].fitness) {
		return clone(population[i1]);
	}
	else {
		return clone(population[i2]);
	}
};

var rouletteWheel = function() {
	var fitness = 0;
	population.forEach(function(subject){
		fitness += subject.fitness;
	});

	var f = Math.floor(Math.random() * (fitness));

	fitness = 0;
	subject = population[0];
	for (var i=0; i<options.populationLength; i++) {
		fitness += population[i].fitness;
		if (f > fitness) {
			break;
		}
		subject = population[i];
	}

	return clone(subject);
}

var countSize = function(stylesheet) {
	var s = 0;
	var d = 0;
	stylesheet.rules.forEach(function(rule) {
		s += rule.selectors.length - 1;
		rule.selectors.forEach(function(sel) {
			s += sel.length;
		});
	});
	stylesheet.rules.forEach(function(rule) {
		d += 2;
		rule.declarations.forEach(function(dec) {
			d += dec.length;
		});
	});

	cssSize = s + d;
}

var getFitness = function(stylesheet) {
	var fitness = Infinity;
	var s = 0;
	var d = 0;
	stylesheet.rules.forEach(function(rule) {
		s += rule.selectors.length - 1;
		rule.selectors.forEach(function(sel) {
			s += sel.length;
		});
	});
	stylesheet.rules.forEach(function(rule) {
		d += 2;
		rule.declarations.forEach(function(dec) {
			d += dec.length;
		});
	});

	stylesheet.fitness = cssSize - ( s + d );
};


var mutate = function(stylesheet) {
	var random = Math.random();
	if (random < options.mutateLine) {
		mutateSplit(stylesheet);
	}
	else if (random < 1.0) {
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


	var mayMerge = [];
	declarations2.forEach(function(d2){
		declarations1.forEach(function(d1){
			if (d1 === d2) {
				mayMerge.push(clone(d1));
			}
		});
	});

	if (mayMerge.length) {
		declarations1.remove(mayMerge);
		declarations2.remove(mayMerge);

		var remove = 0;
		if (!declarations1.length) {
			stylesheet.rules.splice(i1,1);
			remove = i1 < i2 ? 1 : 0;
		}
		if (!declarations2.length) {
			stylesheet.rules.splice(i2 - remove,1);
		}

		var o = {
			'selectors': clone(selectors1).concat(clone(selectors2)).unique(),
			'declarations': clone(mayMerge)
		};

		var added = false;
		stylesheet.rules.forEach(function(rule){
			if (checkArrays(rule.selectors, o.selectors)){
				rule.declarations = rule.declarations.concat(clone(o.declarations)).unique();
				added = true;
			}
		});
		if (!added) {
			stylesheet.rules.push(o);
		}
	}

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
					rule.declarations = rule.declarations.concat(clone(r1.declarations)).unique();
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

	if (Math.random() < options.crossover) {

		var s1mid = Math.floor(Math.random() * (s1.rules.length));
		var s1l = s1.rules.slice(0,s1mid); 
		var s1r = s1.rules.slice(s1mid); 


		var s2mid = Math.floor(Math.random() * (s2.rules.length));
		var s2l = s2.rules.slice(0,s2mid); 
		var s2r = s2.rules.slice(s2mid); 

		return {
			's1': {
				'rules': clone(s1l).concat(clone(s2r)).concat(clone(s1r)).unique(),
				'fitness': 0
			},
			's2': {
				'rules': clone(s2l).concat(clone(s1r)).concat(clone(s2r)).unique(),
				'fitness': 0
			},
		};
	}
	else {
		return {
			's1': s1,
			's2': s2
		};
	}
};


/*
	Algorithm:
	- read file and parse CSS
	- create an initial population
	- minification process (while not finished loop)
	- create a min css and save a file
 */


/*
	read file and parse CSS
 */

Q.fcall(function(){
	var file = process.argv[2];
	if (!file) throw new Error('CSS file not specified!');
	return file;
})
.then(function(file){
	console.log('Parsing:', file);
	var prefix = file.split(/css$/)[0];
	minFile = prefix ? (prefix + 'min.css') : 'min.css';
	return Q.nfcall(fs.readFile, file);
})
.then(function(data){
	return data.toString();
})
.then(function(cssString){
	// console.log(util.inspect(css.parse(cssString), false, null));
	return css.parse(cssString);
})
.then(function(css){
	return parseCSS(css);
})

/*
	initial population
 */

.then(function(stylesheet){
	countSize(stylesheet);
	stylesheet.fitness = 0;

	for (var i=0; i<options.populationLength; i++) {
		population.push(clone(stylesheet));
	}
})

/*
	minification process
 */

.then(function(){
	console.log('Minifying...');
	var g = 0;
	sort();

	var lastFitness = 0;
	var notChangedRounds = 0;

	while (g < options.maxGenerations) {
		g++;

		var newPopulation = [];
		addElites(newPopulation);

		while (newPopulation.length < options.populationLength) {
			var ss;

			if (options.selection == 'tournament') {
				ss = crossover(tournament(), tournament());
			}
			else if (options.selection == 'roulllete') {
				ss = crossover(rouletteWheel(), rouletteWheel());
			}
			else {
				ss = crossover(tournament(), tournament());
			}
			mutate(ss.s1);
			mutate(ss.s2);

			getFitness(ss.s1);
			getFitness(ss.s2);

			newPopulation.push(ss.s1);
			newPopulation.push(ss.s2);
		}

		population = newPopulation;
		sort();
		// console.log('============');
		// console.log(g, population[0].fitness);
		console.log(population[0].fitness);

		if (lastFitness == population[0].fitness) {
			notChangedRounds++;
		}
		else {
			notChangedRounds = 0;
			lastFitness = population[0].fitness;
		}

		if (options.roundOut - 1 <= notChangedRounds) {
			break;
		}
	}

	return population[0];
})

/*
	create a min css and save a file
 */

.then(function(tree){
	// console.log(util.inspect(tree, false, null));
	var css = '';
	tree.rules.forEach(function(rule) {
		css += rule.selectors.join(',');
		css += '{';
		css += rule.declarations.join('');
		css += '}';
		css += '\n';
	});
	return css;
})
.then(function(css){
	console.log('Saving:', minFile);
	return Q.nfcall(fs.writeFile, minFile, css);

})
.then(function(){
	console.log('Done:', minFile);
}, function (error) {
	console.log(error)
	process.exit(1);
})
.done();

