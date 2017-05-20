'use strict';
/**
 * Simple loader that decrypts the data file into memory
 * and parses it.
 * 
 * This is a pretty naive implementation and would likely
 * benefit from using the `stream-json` package if the 
 * data file becomes too large.
 */
let crypto = require('crypto');
let fs = require('fs');
let path = require('path');
let zlib = require('zlib');

const ALGORITHM = 'aes-256-ctr';

module.exports = function CryptoLoader(config) {
    this.load = function () {
        return new Promise(function (resolve, reject) {
            let dataFile = path.join(__dirname, '..', '..', config.dataFile);
            if (!fs.existsSync(dataFile)) {
                throw new Error(`Unable to load data file ${dataFile}`);
            }

            if (!config.dataPassword) {
                throw new Error('Must set dataPassword config variable.');
            }

            let loaded = '';
            let stream = fs.createReadStream(dataFile)
                .pipe(crypto.createDecipher(ALGORITHM, config.dataPassword))
                .pipe(zlib.createGunzip())
                .on('data', function (chunk) {
                    loaded += chunk;
                })
                .on('end', function () {
                    console.log('Decrypted local data file.');
                    resolve(JSON.parse(loaded));
                });
        });
    };
};
