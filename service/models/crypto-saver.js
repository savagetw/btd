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
module.exports = function CryptoSaver(dataFile, currentData) {
    return new Promise(function (resolve, reject) {
        if (isSaving) {
            console.log(`Already saving ${dataFile}`);
            return resolve(false);
        }

        isSaving = true;

        let password = process.env.BTD_DATA_PASSWORD;
        if (!password) {
            throw new Error('Must set BTD_DATA_PASSWORD environment variable.');
        }

        if (fs.existsSync(dataFile)) {
            fs.renameSync(dataFile, `${Date.now()}.${dataFile}`);
        }

        let stream = zlib.createGzip();
        stream
            .pipe(crypto.createCipher(ALGORITHM, password))
            .pipe(fs.createWriteStream(dataFile))
            .on('finish', function () {
                isSaving = false;
                console.log(`Saved file ${dataFile}`);
                resolve(true);
            })
            .on('error', function(err) {
                console.log('Yep, error. Error:' + err);
                reject();
            });
        stream.write(JSON.stringify(currentData));
        stream.end();
    })
    .catch(function () {})
    .then(function () {
        isSaving = false;
    });
};
