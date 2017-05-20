'use strict';
/**
 * Simple saver that stringifies the data and encrypts it to
 * the data file.
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

let isSaving = false;

// Async Promise. Resolves to `true` if save happened, resolves
// to `false` if save was skipped.
module.exports = function CryptoSaver(config) {
    this.save = function(currentData) {
        return new Promise(function (resolve, reject) {
            if (isSaving) {
                console.log(`Already saving ${config.dataFile}`);
                return resolve(false);
            }

            isSaving = true;

            if (!config.dataPassword) {
                throw new Error('Must set dataPassword config variable.');
            }

            let dataFile = path.join(__dirname, '..', '..', config.dataFile);
            if (fs.existsSync(dataFile)) {
                fs.renameSync(dataFile, `${Date.now()}.${path.basename(dataFile)}`);
            }

            let stream = zlib.createGzip();
            stream
                .pipe(crypto.createCipher(ALGORITHM, config.dataPassword))
                .pipe(fs.createWriteStream(dataFile))
                .on('finish', function () {
                    isSaving = false;
                    console.log(`Saved file ${dataFile}`);
                    resolve(true);
                })
                .on('error', function (err) {
                    isSaving = false;
                    reject(err);
                });
            stream.write(JSON.stringify(currentData));
            stream.end();
        });
    };
};
