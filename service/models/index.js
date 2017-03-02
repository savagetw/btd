'use strict';

let _ = require('lodash');

let CryptoLoader = require('./crypto-loader.js');
let PlainTextLoader = require('./plaintext-loader.js');
let CryptoSaver = require('./crypto-saver.js');
let __data = {};
let isDirty = false;

module.exports = function (dataFile) {
    console.log(`Using data file ${dataFile}`);

    load(dataFile);
    
    setInterval(function () {
        if (!isDirty) {
            return;
        }
        save(dataFile);
    }, 300000);

    return {
        set: set, 
        get: get,
        find: find,
        people: new People(id),
        weekends: new Weekends(id),
        meta: new Meta()
    };
};

function load(dataFile) {
    // CryptoLoader(dataFile)
    //     .then(function (data) {
    //         __data = data;
    //     });
    PlainTextLoader(dataFile)
        .then(function (data) {
            __data = data;
        })
        .catch(function (err) {
            console.log('Failed to load. Error:' + err);
        });
}

function save(dataFile) {
    CryptoSaver(dataFile, __data)
        .then(function (didSave) {
            if (didSave) {
                isDirty = false;
            }
        })
        .catch(function (err) {
            console.log(`Failed to save data. Error: ${err}`);
        });
}

function set(collection, key, value) {
    isDirty = true;
    __data[collection][key] = value;
    save();
}

function get(collection, key) {
    return __data[collection][key];
}

function find(collection, search) {
    let components = search.split(/\s+/g);

    let hits = __data[collection];
    for(let i = 0; i < components.length; i++) {
        console.log(`Search[${i}]: ${components[i]} of ${hits.length}`);
        if (!hits.length) {
            break;
        }

        let searchExp = new RegExp(components[i], 'i');
        hits = hits.filter(function (person) {
            return hasMatchingContent(person, searchExp);
        });
    }
    return hits;
}

function hasMatchingContent(haystack, needle) {
    if (typeof haystack === 'string') {
        return needle.test(haystack);
    }

    let match = false;
    for (let prop in haystack) {
        if (match |= hasMatchingContent(haystack[prop], needle)) {
            return match;
        }
    }
    return false;
}

function Meta() {
    this.get = function () {
        return __data['meta'];
    }
}

function People(id) {
    this.byId = function (_id) {
        return __data.people.find(function (person) {
            return person._id === _id;
        });
    };

    this.candidates = function (gender) {
        return __data.people.filter(function (person) {
            return person.gender === gender && 
                !person.candidateOn &&
                person.status === 'candidate' && 
                (!person.experiences || person.experiences.length === 0);
        });
    };

    this.addExperience = function (person, weekend) {
        person.experiences = person.experiences || [];
        let existing = person.experiences && person.experiences.find(function (experience) {
            return experience.weekendNumber === weekend.weekendNumber && experience.weekendGender === weekend.gender;
        });

        if (existing) {
            throw new Error('Experience already added.');
        }

        person.experiences.push({
            weekendGender: weekend.gender,
            weekendNumber: weekend.weekendNumber
        });
    }

    this.removeExperience = function (person, weekend) {
        if (!person.experiences) {
            console.log(`${printPerson(person)} has no experiences to remove.`);
            return;
        }
        for (let i = 0; i < person.experiences.length; i++) {
            let experience = person.experiences[i];
            if (experience.weekendNumber === weekend.weekendNumber && experience.weekendGender === weekend.gender) {
                console.log(`Removing experience on ${printWeekend(weekend)} from ${printPerson(person)}`);
                person.experiences.splice(i, 1);
                return;
            }
        }
    }
}

function matchesWeekend(haystack) {
    return function (needle) {
        
    };
}

function Weekends(id) {
    let weekends = this;

    let __currentWeekend = {
        male: undefined,
        female: undefined
    };

    this.current = function (gender) {
        return getCurrentWeekend(gender);
    };

    this.set = function (gender, weekend) {
        __currentWeekend[gender] = weekend;
    }

    this.get = function (gender, weekendNumber) {
        return __data.weekends.find(function (weekend) {
            return weekend.gender === gender && weekend.weekendNumber === weekendNumber;
        });
    }

    this.addAttendee = function (weekend, person) {
        let existing = weekend.attendees.find(function (attendee) {
            return attendee.person._id === person._id;
        });

        if (existing) {
            throw new Error(`${printPerson(person)} already attending ${printWeekend(weekend)}`);
        }

        console.log(`Adding person ${printPerson(person)}`);
        weekend.attendees.push(new Attendee(person));
    };

    this.removeAttendee = function (weekend, person) {
        for (let i = 0; i < weekend.attendees.length; i++) {
            let attendee = weekend.attendees[i];
            if (attendee.person._id === person._id) {
                console.log(`Removing ${printPerson(person)} from ${printWeekend(weekend)}`)
                weekend.attendees.splice(i, 1);
                return;
            } 
        }
    }

    this.setCurrentWeekendNumber = function (weekendNumber) {
        __data['meta'].currentWeekendNumber = weekendNumber;
        console.log(`Changed the current weekend number to ${weekendNumber}`);
    };

    this.add = function (weekendNumber) {
        __data.weekends.push(new Weekend('male', weekendNumber));
        __data.weekends.push(new Weekend('female', weekendNumber));
        console.log(`Added both Male and Female weekends #${weekendNumber}`);
    };

    this.close = function (gender, weekendNumber) {
        let weekend = weekends.get(gender, weekendNumber);
        if (!weekend) {
            console.log(`Failed to find the ${gender} #${weekendNumber} weekend.`);
            return;
        }

        if (weekend.$closed) {
            console.log(`Already closed the ${gender} #${weekendNumber} weekend.`);
            return;
        }

        weekend.$closed = true;
        console.log(`Closed the ${gender} #${weekendNumber} weekend.`);
    };

    function getCurrentWeekend(gender) {
        // Return cached value.
        if (__currentWeekend[gender] !== undefined) {
            let currentWeekendNumber = __data['meta'].currentWeekendNumber;
            if (!currentWeekendNumber || __currentWeekend[gender].weekendNumber === currentWeekendNumber ) {
                if (!__currentWeekend[gender].$closed) {
                    return __currentWeekend[gender];
                }
            }

            // Weekend number has been changed or removed, invalidate cache.
            __currentWeekend[gender] = undefined;
            console.log(`Invalidated current weekend due to changed current weekend number.`);
        }

        // Determine weekend from the currentWeekendNumber metadata.
        let currentWeekendNumber = __data['meta'].currentWeekendNumber;
        if (currentWeekendNumber !== undefined) {
            console.log(`Trying to find ${gender} weekend #${currentWeekendNumber}...`);
            __currentWeekend[gender] = __data['weekends'].find(function (weekend) {
                return weekend.gender === gender && weekend.weekendNumber === currentWeekendNumber;
            });

            if (__currentWeekend[gender]) {
                console.log(`Current weekend is #${__currentWeekend[gender].weekendNumber}`);
                return __currentWeekend[gender];
            }
            
            // Current weekend number is either not found or was removed.
            console.log(`Failed to find weekend ${currentWeekendNumber}`);
            __data['meta'].currentWeekendNumber = undefined;
        }

        // Consider the highest numbered weekend the current.
        __data['weekends'].forEach(function (weekend) {
            if (weekend.gender !== gender || weekend.$closed) {
                return;
            }

            if (__currentWeekend[gender] === undefined) {
                __currentWeekend[gender] = weekend;
                return;
            }

            if (weekend.weekendNumber > __currentWeekend[gender].weekendNumber) {
                __currentWeekend[gender] = weekend;
            }
        });

        __data['meta'].currentWeekendNumber = __currentWeekend[gender].weekendNumber;
        console.log(`Found ${__currentWeekend[gender].weekendNumber} to be the current (highest).`);
        return __currentWeekend[gender];
    }

    function Weekend(gender, weekendNumber_) {
        this._id = id();           
        this.community = 'Birmingham Tres Dias';
        this.gender = gender;
        this.weekendNumber = weekendNumber_;
        this.attendees = [];
    }

    function Attendee(person, role) {
        return {
            didAttend: false,
            isConfirmed: false,
            person: _.pick(person, ['_id', 'firstName', 'lastName', 'preferredName']),
            role: role
        }
    }
}

let __id;
function id() {
    if (__id === undefined) {
        __id = __data['meta'].currentId;
    }
    return ++__id;
}

function printWeekend(weekend) {
    let label = weekend.gender === 'male' ? 'Men\'s' : 'Women\'s';
    return `${label} #${weekend.weekendNumber} (${weekend._id})`;
}

function printPerson(person) {
    return `${person.preferredName || person.firstName} ${person.lastName} (${person._id})`
}