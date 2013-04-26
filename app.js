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
});

var init = function(tree) {
	var stylesheet = tree;
	stylesheet.fitness = getFitness(stylesheet.rules);

	console.log(stylesheet);

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

var mutateMerge = function(){

};

var mutateSplit = function(){

};

var crossover = function(){

};

