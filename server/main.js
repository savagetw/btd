import { People } from '/imports/people.js';
import { Weekends } from '/imports/weekends.js';
import { WeekendRoles } from '/imports/weekend-roles.js';
import { Meteor } from 'meteor/meteor';

Meteor.publish('people-search', function (search, genderFilter) {
    check(search, Match.OneOf(String, null, undefined));

    let query = {};
    let projection = { limit: 10, sort: { lastName: 1, firstName: 1 } };

    if (search) {
        let words = search.split(' ');
        let queries = genderFilter ? [genderFilter] : [];
        words.forEach(function (word) {
            let regexStr = '';
            for (let i = 0, len = word.length; i < len; i++) {
                regexStr += word[i];
                if (i < len) {
                    regexStr += '.*';
                }
            }
            let regex = new RegExp(regexStr, 'i');

            let query = {$or: []};
            ['firstName', 'preferredName', 'lastName', 'address.city'].forEach(function (field) {
                let orQuery = {};
                orQuery[field] = regex;
                query.$or.push(orQuery);
            });

            let emailquery = {
                'emails': {
                    $elemMatch: {'address': regex}
                }
            };

            query.$or.push(emailquery);
            queries.push(query);
        });

        let regex = new RegExp(search, 'i');
        projection.limit = 100;
        query.$and = queries;
    }
    return People.find(query, projection);
});

Meteor.publish('people', function (filter) {
    return People.find(filter);
});

Meteor.publish('person', function (id) {
    return People.find({'_id': id});
});

Meteor.publish('weekends', function () {
    return Weekends.find();
});

Meteor.publish('weekendRoles', function () {
    return WeekendRoles.find();
});

Meteor.publish('weekend-details', function (weekendNumber, gender) {
    return Weekends.find({weekendNumber: weekendNumber, gender: gender});
});

Meteor.publish('attendee-details', function (personIds) {
    return People.find({'_id': {'$in': personIds}});
});
