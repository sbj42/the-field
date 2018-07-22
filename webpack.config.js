var path = require('path');
var config = require('./package.json');

var minify = process.argv.indexOf('-p') !== -1;

var filename = 'the-field-' + config.version
if (minify) {
    filename += '.min.js';
} else {
    filename += '.js';
}

module.exports = {
    entry: "./src/index.ts",
    mode: 'production',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'bin'),
        publicPath: '/bin/',
        filename: filename,
        libraryTarget: "var",
        library: "TheField"
    },
    resolve: {
        extensions: ['.ts']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [ 'ts-loader' ]
            }
        ]
    }
};