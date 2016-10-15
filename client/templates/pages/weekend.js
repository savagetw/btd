import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Weekends } from '/imports/weekends.js';
import { WeekendRoles } from '/imports/weekend-roles.js';
import { People } from '/imports/people.js';

Template.weekend.helpers({
    weekendTitle() {
        let weekend = Template.instance().weekend.get();
        if (!weekend) {
            return 'Loading...';
        }
        let genderTitle = weekend.gender === 'Male' ? 'Men\'s' : 'Women\'s';
        return genderTitle + ' Weekend #' + weekend.weekendNumber;
    },
    rectorName() {
        let template = Template.instance();
        let attendees = template.attendees.get();
        if (!attendees) {
            return 'Unknown';
        }
        let found = attendees.find(function (attendee) {
            return attendee.role.title === 'Rector';
        });
        if (!found) {
            return 'Unknown';
        }
        return getName(found.person);
    },
    name: getName,
    attendees() {
        var attendees = Template.instance().attendees.get();
        console.log('attendees helper', attendees);
        return attendees;
    }
});

function getName(person) {
    if (!person) {
        return 'John Doe';
    }
    return (person.preferredName || person.firstName) + ' ' + person.lastName;
};

Template.weekend.onCreated(() => {
    let template = Template.instance();
    template.weekendNumber = parseInt(FlowRouter.getParam('weekendNumber'), 10);
    template.gender = FlowRouter.getParam('gender');
    template.weekend = new ReactiveVar();
    template.attendees = new ReactiveVar();

    template.autorun(() => {
        template.subscribe('weekend-details', template.weekendNumber, template.gender);

        let weekend = Weekends.findOne({weekendNumber: template.weekendNumber, gender: template.gender});
        if (!weekend) {
            return;
        }

        template.weekend.set(weekend);

        template.subscribe('weekend-roles');

        let attendees = weekend.attendees;
        let personIds = attendees.map(function (attendee) {
            return attendee.personId;
        });

        if (personIds.length === 0) {
            return;
        }

        template.subscribe('attendee-details', personIds);

        let roles = WeekendRoles.find().fetch();
        let people = People.find(
            {"_id": {"$in": personIds}},
            {fields: {preferredName: 1, firstName: 1, lastName: 1}}
        ).fetch();

        if (people.length === 0 || roles.length === 0) {
            return;
        }

        template.attendees.set(attendees.map(function (unresolvedAttendee) {
            return {
                person: people.find(function (person) {
                    return person._id === unresolvedAttendee.personId;
                }),
                role: roles.find(function (role) {
                    return role._id === unresolvedAttendee.roleId;
                })
            };
        }));
    });
});
