'use strict';

const TABLE_NAMES = require('../../config.json').table_names;
const BEST_SCORE = 100;
const SEATS_PER_TABLE = 8;

module.exports = function assignToTables(candidates, silentProfessors, speakingProfessors, gender, maxTables) {
    let people = candidates
        .concat(silentProfessors.map(function (professor) {
            professor.isProfessor = true;
            professor.isSpeaking = false;
            return professor;
        }))
        .concat(speakingProfessors.map(function (professor) {
            professor.isProfessor = true;
            professor.isSpeaking = true;
            return professor;
        }))

    maxTables = maxTables || TABLE_NAMES.length;
    if (maxTables > TABLE_NAMES.length) {
        throw new Error('Insuffient tables defined in config.json');
    }

    let tables = [];
    for (let i = 0; i < maxTables; i++) {
        tables.push({name: TABLE_NAMES[gender][i], people: []});
    }
    
    let MAX_SEATS = tables.length * SEATS_PER_TABLE;
    if (people.length > MAX_SEATS) {
        throw new Error('More people than seats!');
    }

    let bestSolvedScore = 0;
    let remainingTries = 50000;
    let result = solve(people, tables);
    while (result.score !== BEST_SCORE && remainingTries) {
        let current = solve(shuffle(people), tables);
        if (current.score > result.score) {
            result = current;
        }
        remainingTries--;
    }

    return result;
    
    // Perform a greedy best-fit. Returns an object w schema: {score: <int>, people: <collection>}
    function solve(people, tables) {
        let score = BEST_SCORE;
        people.forEach(function (person) {
            let leastConflicts = MAX_SEATS;
            let bestTable = 0;

            for (let i = 0; i < tables.length; i++) {
                let result = countConflictsAt(tables[i], person);

                // Always seat at first empty table
                if (result === 0) {
                    bestTable = i;
                    break;
                }

                if (result < leastConflicts) {
                    bestTable = i;
                    leastConflicts = result;
                }
            }
            tables[bestTable].people.push(person);
        });

        return {
            score: getTableScore(tables),
            tables: tables
        };
    }

    function countConflictsAt(table, person) {
        let professorsAtTable = 0;
        let hasSpeakingProfessor = false;
        let hasSilentProfessor = false;
        let conflicts = table.people.reduce(function (conflicts, tableMember) {

            // Having someone at the table is a conflict. Prefer empty tables.
            conflicts++;

            if (tableMember.isProfessor) {
                professorsAtTable++;
                hasSpeakingProfessor |= tableMember.isSpeaking === true;
                hasSilentProfessor |= tableMember.isSpeaking === false;
            }

            // Try harder to separate by church.
            if (person.church === tableMember.church) {
                conflicts += 3;
            }

            // Try even harder to separate where same sponsor.
            if (person.sponsor === tableMember.sponsor) {
                conflicts += 5;
            }

            return conflicts;
        }, 0);

        // Ensure that professors are distributed two to a table, preferring
        // one silent and one speaker at each.
        if (person.isProfessor) {
            if (professorsAtTable >= 2) {
                return BEST_SCORE * 2; // REALLY, REALLY do not want more than 2 professors at a table.
            } 

            if (person.isSpeaking && hasSpeakingProfessor) {
                conflicts += 25;
            }

            if (person.isSpeaking === false && hasSilentProfessor) {
                conflicts += 25
            }
        }

        return conflicts;
    }

    function getTableScore(tables) {
        return tables.reduce(function (score, table) {
            let people = table.people;
            let hasSpeakingProfessor = false;
            let hasSilentProfessor = false;
            let professorCount = 0;
            for (let i = 0; i < people.length; i++) {
                for (let j = 0; j < people.length; j++) {
                    if (i === j) {
                        continue;
                    }

                    if (people[i].isProfessor) {
                        professorCount++;

                        if(people[i].isSpeaking === true) {
                            hasSpeakingProfessor = true;
                        }

                        if(people[i].isSpeaking === false) {
                            hasSilentProfessor = true;
                        }
                    }

                    if (people[i].sponsor === people[j].sponsor) {
                        score--;
                    }

                    if (people[i].church === people[j].church) {
                        score--;
                    }
                }
            }

            if (!hasSilentProfessor) {
                score -= 2;
            }

            if (!hasSpeakingProfessor) {
                score -= 2;
            }

            if (professorCount > 2) {
                score -= 20;
            }
            return score;
        }, BEST_SCORE);
    }
};

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
