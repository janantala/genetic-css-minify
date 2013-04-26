var fs = require('fs');
var util = require('util');
var css = require('css');

var file = 'style.css';

fs.readFile(file, function (err, data) {
	if (err) throw err;
	var cssString = data.toString();

	var obj = css.parse(cssString);
	console.log(util.inspect(obj, false, null));


});


