import { People } from '/imports/people.js';
import { Weekends } from '/imports/weekends.js';
import { WeekendRoles } from '/imports/weekend-roles.js';
import { Meteor } from 'meteor/meteor';

Meteor.publish('people', function (search) {
    check(search, Match.OneOf(String, null, undefined));

    let query = {};
    let projection = { limit: 10, sort: { lastName: 1, firstName: 1 } };

    if (search) {
        let regex = new RegExp(search, 'i');
        query = {
            $or: [
                { firstName: regex },
                { preferredName: regex },
                { lastName: regex },
                { email: regex }
            ]
        };

        projection.limit = 100;
    }

    return People.find(query, projection);
});

Meteor.publish('person', function (id) {
    return People.find({'_id': id});
});

Meteor.publish('weekends', function () {
    return Weekends.find();
});

Meteor.publish('weekend-roles', function () {
    return WeekendRoles.find();
});

Meteor.publish('weekend-details', function (weekendNumber, gender) {
    return Weekends.find({weekendNumber: weekendNumber, gender: gender});
});

Meteor.publish('attendee-details', function (personIds) {
    return People.find({'_id': {'$in': personIds}});
});
