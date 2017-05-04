'use strict';
/**
 * Simple saver that stringifies the data and saves it to
 * the data file.
 * 
 * This is a pretty naive implementation and would likely
 * benefit from using the `stream-json` package if the 
 * data file becomes too large.
 */
let fs = require('fs');
let path = require('path');

let isSaving = false;

// Async Promise. Resolves to `true` if save happened, resolves
// to `false` if save was skipped.
module.exports = function plainTextSaver(dataFile, currentData) {
    return new Promise(function (resolve, reject) {
        if (isSaving) {
            console.log(`Already saving ${dataFile}`);
            return resolve(false);
        }

        isSaving = true;

        if (fs.existsSync(dataFile)) {
            fs.renameSync(dataFile, `${Date.now()}.${path.basename(dataFile)}`);
        }

        let stream = fs.createWriteStream(dataFile);
        stream
            .on('finish', function () {
                isSaving = false;
                console.log(`Saved file ${dataFile}`);
                resolve(true);
            })
            .on('error', reject);
        stream.write(JSON.stringify(currentData));
        stream.end();
    })
    .then(function () {
        isSaving = false;
    });
};
