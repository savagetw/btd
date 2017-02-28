'use strict';

// let generate = require('../service/weekend-utils/table-assignment.js').generateMaleTableProposals;

describe('table assignment', function () {
    let spec;

    beforeEach(function () {
        spec = this;
    })

    // it('should separate users by sponsor', function () {
    //     let users = [
    //         {name: 'User1', church: 'Church1', sponsor: 'Sponsor1'},
    //         {name: 'User2', church: 'Church1', sponsor: 'Sponsor2'},
    //         {name: 'User3', church: 'Church1', sponsor: 'Sponsor3'}
    //     ]

    //     let tables = generate(users, 3);
    //     expect(tables[0].candidates.length).toEqual(1);
    //     expect(tables[1].candidates.length).toEqual(1);
    //     expect(tables[2].candidates.length).toEqual(1);
    // });

    it('should be great', function () {

    });
});


// Make a new solver. Call solver.next() to get the next highest solution.
function Solver(users) {
    users = users.slice(0);
    let userToSeat = users.pop();
    let solutions = this.solve(new Array(users.length), users, userToSeat);

    this.solve = function (tableAssignments, remainingUsers, userToSeat) {
        if (!seatUser(tableAssignments, userToSeat)) {
            return undefined;
        }

        if (!hasOpenSeats(tableAssignments)) {
            return tableAssignments;
        }

        remainingUsers = remainingUsers.slice(0);

        for(let i = 0; i < remainingUsers.length; i++) {
            let userToSeat = remainingUsers[i];
            remainingUsers.splice(i, 1);
            
            let result = this.solve(tableAssignments, remainingUsers, userToSeat);
            if (result) {
                return result;
            }

            remainingUsers.splice(i, 0, userToSeat);
        }
    }

    function seatUser(tableAssignments, candidate) {
        for(let i = 0; i < tableAssignments; i++) {
            if (tableAssignments[i]) {
                continue;
            }

            // This is the place to consider whether or not this assignment 
            // is viable!

            tableAssignments[i] = candidate;
            return true;
        }
        return false;
    }

    function hasOpenSeats(tableAssignments) {
        return tableAssignments.some(function (user) {
            return !!user;
        });
    }
}