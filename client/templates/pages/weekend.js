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
        let weekend = Template.instance().weekend.get();
        if (!weekend) {
            return;
        }
        let attendance = weekend.attendees.find(function (attendee) {
            return attendee.roleTitle === 'Rector';
        });

        if (!attendance) {
            return;
        }

        return getName(attendance.person);
    },
    name: getName,
    attendees() {
        let weekend = Template.instance().weekend.get();
        if (!weekend) {
            return;
        }
        return weekend.attendees;
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

    template.autorun(() => {
        template.subscribe('weekend-details', template.weekendNumber, template.gender);
        let weekend = Weekends.findOne({weekendNumber: template.weekendNumber, gender: template.gender});
        if (!weekend) {
            return;
        }
        template.weekend.set(weekend);
    });
});
