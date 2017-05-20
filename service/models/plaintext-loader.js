'use strict';
/**
 * Simple loader that reads the data file into memory
 * and parses it.
 * 
 * This is a pretty naive implementation and would likely
 * benefit from using the `stream-json` package if the 
 * data file becomes too large.
 */
let fs = require('fs');
let path = require('path');

module.exports = function PlainTextLoader(config) {
    this.load = function () {
        return new Promise(function (resolve, reject) {
            let dataFile = path.join(__dirname, '..', '..', config.dataFile);
            if (!fs.existsSync(dataFile)) {
                throw new Error(`Unable to load data file ${dataFile}`);
            }

            let loaded = '';
            let stream = fs.createReadStream(dataFile)
                .on('data', function (chunk) {
                    loaded += chunk;
                })
                .on('end', function () {
                    resolve(JSON.parse(loaded));
                });
        });
    };
};
