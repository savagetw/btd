'use strict';

let _ = require('lodash');

let __data = {};
let isDirty = false;

module.exports = function (config) {
    let Loader = require(`./${config.loaderType}-loader.js`);
    let Saver = require(`./${config.saverType}-saver.js`);
    let loader = new Loader(config);
    let saver = new Saver(config);

    loader.load().then(function (data) {
        __data = data;
    }).catch(function (err) {
        console.log('Failed to load. Error: ' + err.message);
        throw err;
    });

    setInterval(function () {
        if (!isDirty) {
            console.log('Skipping save of data file (unchanged)');
            return;
        }
        save();
    }, config.saveIntervalMs);

    return {
        set: set, 
        get: get,
        find: find,
        users: new Users(),
        people: new People(id),
        weekends: new Weekends(id),
        roles: new Roles(id),
        meta: new Meta()
    };

    function save() {
        saver.save(__data).then(function (didSave) {
            if (didSave) {
                isDirty = false;
            }
        }).catch(function (err) {
            console.log(`Failed to save data. Error: ${err}`);
        });
    }
 
    function set(collection, key, value) {
        isDirty = true;
        __data[collection][key] = value;
        save();
    }
};

function get(collection, key) {
    if (key) {
        return __data[collection][key];
    } else {
        return __data[collection];
    }
}

function find(collection, search) {
    let components = search.split(/\s+/g);

    let hits = __data[collection];
    for(let i = 0; i < components.length; i++) {
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

function Users() {
    this.auth = function (username, password) {
        return !!__data.users.find(function (user) {
            return user.username === username && user.password === password;
        });
    };
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

    this.addExperience = function (person, weekend, role) {
        person.experiences = person.experiences || [];
        let existing = person.experiences && person.experiences.find(function (experience) {
            return experience.weekendNumber === weekend.weekendNumber && experience.weekendGender === weekend.gender;
        });

        if (existing) {
            existing.role = role;
            isDirty = true;
            return;
        }
   
        person.experiences.push({
            weekendGender: weekend.gender,
            weekendNumber: weekend.weekendNumber,
            role: role
        });
        isDirty = true;        
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
                isDirty = true;
                return;
            }
        }
    }

    this.withExperience = function (roleId) {
        return __data.people.reduce(function (peopleWithExperiences, person) {
            if (!person.experiences) {
                return peopleWithExperiences;
            }

            var roleExperiences = person.experiences.filter(function (experience) {
                return experience.role && experience.role._id === roleId;
            });

            if (!roleExperiences.length) {
                return peopleWithExperiences;
            }

            return peopleWithExperiences.concat({
                _id: person._id,
                firstName: person.firstName,
                preferredName: person.preferredName,
                lastName: person.lastName,
                experiences: roleExperiences
            });
        }, []);
    };

    this.sponsoredBy = function (sponsorId) {
        return __data.people.filter(function (person) {
            return person.sponsor && person.sponsor._id === sponsorId;
        }).map(function (person) {
            return _.pick(person, ['firstName', 'preferredName', 'lastName', 'candidateOn', 'gender', '_id']);
        });
    }
}

function Roles(id) {
    let roles = this;

    roles.byId = function (id) {
        if (!id) {
            return undefined;
        }

        return __data.roles.find(function (role) {
            return role._id === id;
        });
    }

    roles.get = function (forAssignment) {
        if (!forAssignment) {
            return __data.roles;
        }

        // Updates title labels to clearly label head positions
        return _.sortBy(__data.roles.reduce(function (roles, role) {
            let title = role.title;

            if (matches(['Candidate'])) {
                return roles;
            }

            if (matches(['Head', 'Rector', 'Rover'])) {
                roles.push(_.pick(role, ['_id', 'title']));
                return roles;
            }

            if (!role.isHead) {
                roles.push(_.pick(role, ['_id', 'title']));
                return roles;
            }

            if (title.indexOf('(Assistant)') !== -1) {
                roles.push({_id: role._id, title: title.replace('Assistant', 'Assistant Head')});
                return roles;
            } 
            
            roles.push({_id: role._id, title: `${title} (Head)`});
            return roles;

            function matches(possibilities) {
                return possibilities.reduce(function (isMatch, possibility) {
                    return isMatch || title.indexOf(possibility) === 0;
                }, false);
            }
        }, []), 'title');
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
        isDirty = true;
        __currentWeekend[gender] = weekend;
    }

    this.get = function (gender, weekendNumber) {
        return __data.weekends.find(function (weekend) {
            return weekend.gender === gender && weekend.weekendNumber === weekendNumber;
        });
    }

    this.list = function (gender) {
        return __data.weekends.reduce(function (weekends, weekend) {
            maybeAssignRector(weekend);

            let simpleWeekend = {
                gender: weekend.gender,
                weekendNumber: weekend.weekendNumber,
                rector: weekend.rector
            };

            if (!gender) {
                weekends[weekend.gender].push(simpleWeekend);
            } else if (gender === simpleWeekend.gender) {
                weekends.push(simpleWeekend);
            }
            
            return weekends;
        }, gender ? [] : {male: [], female: []});
    }

    function maybeAssignRector(weekend) {
        if (weekend.rector !== undefined) {
            return;
        }

        for (let i = 0; i < weekend.attendees.length; i++) {
            let attendee = weekend.attendees[i];
            if (attendee.role && attendee.role.title && attendee.role.title.toLowerCase() === 'rector') {
                weekend.rector = attendee.person;
                isDirty = true;
                break;
            }
        }

        if (weekend.rector === undefined) {
            weekend.rector = null;
        }
    }

    this.addAttendee = function (weekend, person, role) {
        let existing = weekend.attendees.find(function (attendee) {
            return attendee.person._id === person._id;
        });

        if (existing) {
            existing.role = role;
            isDirty = true;
            return;
        }

        console.log(`Adding person ${printPerson(person)}`);
        weekend.attendees.push(new Attendee(person));
        isDirty = true;
    };

    this.removeAttendee = function (weekend, person) {
        for (let i = 0; i < weekend.attendees.length; i++) {
            let attendee = weekend.attendees[i];
            if (attendee.person._id === person._id) {
                console.log(`Removing ${printPerson(person)} from ${printWeekend(weekend)}`)
                weekend.attendees.splice(i, 1);
                isDirty = true;
                return;
            } 
        }
    }

    this.setCurrentWeekendNumber = function (weekendNumber) {
        __data['meta'].currentWeekendNumber = weekendNumber;
        isDirty = true;
        console.log(`Changed the current weekend number to ${weekendNumber}`);
    };

    this.add = function (weekendNumber) {
        __data.weekends.push(new Weekend('male', weekendNumber));
        __data.weekends.push(new Weekend('female', weekendNumber));
        isDirty = true;
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
        isDirty = true;
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

function hasAny(src, toFind) {
    return _.intersection(toFind, src).length !== 0;
}