# Genetic CSS Minify

### CSS minification based on genetic principes

install dependencies:

    $ npm install

run app:

    $ node app.js your/css/file.css

Read extended docs and experiments in [PDF](https://github.com/janantala/genetic-css-minify/blob/master/docs-sk/document.pdf?raw=true) [SK]

===

### Customization:
You can change these parameters:
- @options.populationLength: total number of stylesheets in one population
- @options.maxGenerations: maximum generations of algorithm
- @options.roundOut: maximum generations without fitness improvement
- @options.mutateLine: line between mutateSplit <0,mutateLine) and mutateMerge <mutateLine,1)
- @options.crossover: crossover propability
- @options.elites: number of elites which are automaticaly passed into a new generation
- @options.selection: selection method - 'tournament' or 'roulllete'

### Fitness
Fitness function is difference between size of original css file and size of minified css file.

### Selection
We use tournament method of size 2 for subject selection. There is also available roulete wheel method in settings.

### Crossover
Crossover takes 2 stylesheets. Creates two new stylesheets. Each contains of the first half of the first stylesheet concates with the second half of the seconds stylesheets. There are also concated rules from the original second half of stylesheet.

### Mutation
There are 2 types of mutation:
- Mutation split: splits a random node with selectors into multiple nodes with one selector
- Mutation merge: merges declarations from two nodes into one if it is possible

### Final state
There are 2 parameters where you can set when the algorithm stops:
- @maxGenerations - maximum generations of algorithm
- @roundOut - maximum generations without fitness improvement

===

### Known bugs:

- CSS3 selectors like @media, @keyframes with own scope are not processed.

===

### Road map:

- add support for CSS3 selectors which generates own scope
- match different written colors, e.g. white, #FFFFFF, rgb(255,255,255)
- match margin, padding, border, e.g. convert margin-left, margin-rigth... into single margin
- create a grunt task

===

### Credits and license:
The MIT License

Copyright (c) 2013 Jan Antala, https://github.com/janantala

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
