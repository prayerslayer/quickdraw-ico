#! /usr/bin/env node
const generate = require('../index');
const cli = require('cli');
const path = require('path')

const args = cli.parse({
    'drawings-dir': ['i', 'Where the drawings are', 'string'],
    'output-dir': ['o', 'Where to put icons', 'string'],
    'include-recognized': ['r', '', true, true],
    'icons-per-word': ['n', 'How many icons per word to include', 'int', 1],
    words: [
        'w',
        'Comma-separated list of words. Leave empty for all words.',
        'string',
        '',
    ],
    countrycode: [
        'c',
        'Only use drawings from this countrycode',
        'string',
        'US',
    ],
});
const recognized = args['include-recognized'];
const drawingsDir = args['drawings-dir'];
const outputDir = args['output-dir'];

if (!drawingsDir) {
  throw new Error(`Must supply drawings directory`)
}
if (!outputDir) {
  throw new Error(`Must supply output directory`)
}

generate({
    drawingsDir: path.resolve(__dirname, drawingsDir),
    outputDir: path.resolve(__dirname, outputDir),
    filter: {
        sample: args['icons-per-word'],
        countrycode: args.countrycode,
        words: args.words ? args.words.split(',').map(s => s.trim()) : [],
        recognized: recognized,
    },
});
