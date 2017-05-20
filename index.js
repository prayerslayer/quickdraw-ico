const path = require('path');
const fs = require('fs');
const line = require('d3-shape').line();

const svgWrapper = '<svg xmlns="http://www.w3.org/2000/svg">$SYMBOLS</svg>';
const symbolWrapper = `<symbol id="$SYMBOL_ID" viewBox="0 0 255 255">$CONTENT</symbol>`;

function getAvailableWords(dir) {
    return fs
        .readdirSync(dir)
        .filter(f => /\.ndjson$/.test(f))
        .map(f => f.substring(0, f.indexOf('.ndjson')));
}

function readFile(
    file,
    filters = { sample: 10, recognized: true, countrycode: 'US' }
) {
    const COUNTRY_REGEX = new RegExp(`"countrycode":"${filters.countrycode}"`);
    const RECOGNIZED_REGEX = /"recognized":true/;
    const UNRECOGNIZED_REGEX = /"recognized":false/;
    return String(fs.readFileSync(file))
        .split('\n')
        .filter(line => line.length > 0)
        .filter(
            line =>
                (filters.recognized === true
                    ? RECOGNIZED_REGEX.test(line)
                    : filters.recognized === false
                          ? UNRECOGNIZED_REGEX.test(line)
                          : true)
        )
        .filter(
            line =>
                (filters.countrycode !== undefined
                    ? COUNTRY_REGEX.test(line)
                    : true)
        )
        .filter((_, i) => (filters.sample > 0 ? i < filters.sample : true))
        .map(line => JSON.parse(line));
}

function zip(a1, a2) {
    return a1.map((a, i) => [a, a2[i]]);
}

function concatStrokes(drawing) {
    return drawing.drawing.map(([xs, ys]) => zip(xs, ys));
}

function toSvgSymbol(id, strokes) {
    const lines = strokes.map(stroke => line(stroke)).join('');
    const g = `<path d="${lines}" />`;
    return symbolWrapper.replace('$CONTENT', g).replace('$SYMBOL_ID', id);
}

function toSVG(symbols) {
    return svgWrapper.replace('$SYMBOLS', symbols);
}

function noWhitespace(str) {
    return str.replace(/\s+/g, '-');
}

function generateTestHtml(outputDir, symbols) {
    let html = `<html><head><title>Quick Draw Icons Test Page</title>`;
    html += `<style>
    .icon-preview {
        float: left;
        font-family: Menlo, monospace;
        padding: 20px;
        width: 100px;
    }
    svg {
        fill: none;
        stroke-width: 2px;
        stroke: #333;
        width: 64px;
        height: 64px;
        margin: 0 auto;
        margin-bottom: 10px;
        display: block;
    }
    </style>`;
    html += `</head><body>`;
    html += symbols
        .map(
            s =>
                `<div class="icon-preview">
        <svg>
            <use xlink:href="./icons.svg#${s.id}"></use>
        </svg>
        <label>${s.id}</label>
        </div>`
        )
        .join('');
    html += `</body>`;
    html += `</html>`;
    fs.writeFileSync(`${outputDir}/index.html`, html);
}

module.exports = function generate(
    config = {
        drawingsDir: path.resolve(__dirname, 'drawings'),
        outputDir: path.resolve(__dirname, 'svg'),
        filter: {
            countrycode: 'US',
            words: [], // all words
            recognized: true,
            sample: 100, // How many to pick per word. 0 = all
        },
    }
) {
    const words = config.filter.words.length === 0
        ? getAvailableWords(config.drawingsDir)
        : config.filter.words;
    const symbols = [];
    words.forEach(word => {
        console.log(`[${word}] Reading file...`);
        const drawings = readFile(
            `${config.drawingsDir}/${word}.ndjson`,
            config.filter
        );
        console.log(`[${word}] Generate SVGs...`);
        Array.prototype.push.apply(
            symbols,
            drawings.map((drawing, i) => ({
                symbol: toSvgSymbol(
                    `${noWhitespace(drawing.word)}-${i}`,
                    concatStrokes(drawing)
                ),
                id: `${noWhitespace(drawing.word)}-${i}`,
            }))
        );
    });
    const svg = toSVG(symbols.map(s => s.symbol));
    fs.writeFileSync(`${config.outputDir}/icons.svg`, svg);
    generateTestHtml(config.outputDir, symbols);
    console.log(`Done, generated ${symbols.length} icons.`);
};
