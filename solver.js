'use strict';

// let solver = new Solver(['thom', 'ben', 'chris', 'jason', 'nick', 'bryan', 'bryan']);
let solver = new Solver([
    'thom', 
    'ben', 
    'chris', 
    'jason', 
    'nick', 
    'bryan', 
    'bryan', 
    'bryan', 
    'bryan', 
    'bryan',
    'thom',
    'thom',
    'thom'
]);
// let solver = new Solver(['bryan', 'thom']);
if (!solver.solutions) {
    console.log('Unsolvable!');
} else {
    console.log(solver.solutions);
}


// Make a new solver. Call solver.next() to get the next highest solution.
function Solver(users) {
    users = users.slice(0);
    const tableAssignments = new Array(users.length);
    const userToSeat = users.pop();
    // //console.log(`Starting: ${tableAssignments} ${users} ${userToSeat}`);
    this.solutions = solve(tableAssignments, users, userToSeat);

    function solve(tableAssignments, remainingUsers, userToSeat) {
        let proposedSolution = assignToNextSeat(tableAssignments, userToSeat);
        if (!proposedSolution) {
            // console.log(`Bad assign ${userToSeat} to ${tableAssignments}`);
            return null;
        }

        if (!hasOpenSeats(proposedSolution)) {
            //console.log(`Assigned ${userToSeat} to ${proposedSolution}`);
            return proposedSolution;
        } else {
            //console.log(`Has open seats: ${proposedSolution}`);
        }

        remainingUsers = remainingUsers.slice(0);
        //console.log(`Remaining people to place ${remainingUsers}`);
        for (let i = 0; i < remainingUsers.length; i++) {
            // Pluck a remaining candidate from the pool and try to seat them
            let userToSeat = remainingUsers[i];
            remainingUsers.splice(i, 1);

            // Does this solve it?
            let result = solve(proposedSolution, remainingUsers, userToSeat);
            if (result) {
                //console.log(`Assigned ${userToSeat} to ${proposedSolution}`);
                return result;
            } else {
                //console.log(`Failed to place ${userToSeat} at ${proposedSolution}`);
            }

            // Put the user back, prepare for next iteration
            remainingUsers.splice(i, 0, userToSeat);
        }

        // Return the solved solution
        //console.log(`Cannot assign ${userToSeat} to ${proposedSolution}`);
        return null;
    }

    function assignToNextSeat(tableAssignments, candidate) {
        tableAssignments = tableAssignments.slice(0);
        for (let i = 0; i < tableAssignments.length; i++) {
            if (tableAssignments[i]) {
                continue;
            }

            // This is the place to consider whether or not this assignment 
            // is viable!
            let matchesPreviousSeat = (i !== 0) && (tableAssignments[i - 1] === candidate);
            if (matchesPreviousSeat) {
                //console.log(`${candidate} cannot sit next to ${tableAssignments[i - 1]}`);
                return null;
            }

            tableAssignments[i] = candidate;
            return tableAssignments;
        }
        return null;
    }

    function hasOpenSeats(proposedSolution) {
        for (let i = 0; i < proposedSolution.length; i++) {
            if (!proposedSolution[i]) {
                return true;
            }
        }
        return false;
    }
}