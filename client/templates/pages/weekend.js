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
            return;
        }
        let genderTitle = weekend.gender === 'Male' ? 'Men\'s' : 'Women\'s';
        return weekend.community + ': ' + genderTitle + ' Weekend #' + weekend.weekendNumber;
    },
    name(person) {
        if (!person) {
            return;
        }
        return (person.preferredName || person.firstName) + ' ' + person.lastName;
    },
    attendees() {
        let template = Template.instance();
        let attendees = template.attendees.get();
        if (attendees) {
            return attendees;
        }

        let weekend = template.weekend.get();
        if (!weekend) {
            return;
        }

        let roles = WeekendRoles.find().fetch();
        console.log('all roles:', roles);
        let personIds = weekend.attendees.map(function (attendee) {
            return attendee.personId;
        });
        let people = People.find(
            {"_id": {"$in": personIds}},
            {fields: {preferredName: 1, firstName: 1, lastName: 1}}
        ).fetch();

        if (people.length === 0 || roles.length === 0) {
            return;
        }

        let resolved = weekend.attendees.map(function (unresolvedAttendee) {
            console.log('resolving', unresolvedAttendee);
            return {
                person: people.find(function (person) {
                    return person._id === unresolvedAttendee.personId;
                }),
                role: roles.find(function (role) {
                    return role._id === unresolvedAttendee.roleId;
                })
            };
        });
        console.log('resolved:', resolved);
        template.attendees.set(resolved);
        return resolved;
    }
});

Template.weekend.onCreated(() => {
    let weekendNumber = parseInt(FlowRouter.getParam('weekendNumber'), 10);
    let gender = FlowRouter.getParam('gender');
    let template = Template.instance();

    template.weekend = new ReactiveVar();
    template.attendees = new ReactiveVar();

    template.autorun(() => {
        template.subscribe('weekend-details', weekendNumber, gender, () => {

            let weekend = Weekends.findOne({weekendNumber: weekendNumber, gender: gender});
            if (!weekend) {
                FlowRouter.renderNotFound();
                return;
            }

            template.subscribe('weekend-roles');

            template.weekend.set(weekend);
            let personIds = weekend.attendees.map(function (attendee) {
                return attendee.personId;
            });
            template.subscribe('attendee-details', personIds);
        });
    });
});
