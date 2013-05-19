# Genetic CSS Minify

### CSS minification based on genetic principes

Work in progress...

### Run: 
```bash 
$ node app.js yorr/css/file.css
```

===

### Customization:
You can change these parameters:
- @populationLength: total number of stylesheets in one population
- @maxGenerations: maximum generations of algorithm
- @mutateLine: line between mutateSplit <0,mutateLine) and mutateMerge <mutateLine,1)
- @elites: number of elites which are automaticaly passed into a new generation
  
### Selection
We use tournament method of size 2 for subject selection.

### Crossover
There is no crossover due to very differences between stylesheet in population.

### Mutation
There are 2 types of mutation:
- Mutation split: splits a random node with selectors into multiple nodes with one selector
- Mutation merge: merges declarations from two nodes into one if it is possible

### Known bugs:

- CSS3 selectors like @media, @keyframes with own scope are not processed.

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
