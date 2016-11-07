import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Weekends } from '/imports/weekends.js';
import { WeekendRoles } from '/imports/weekend-roles.js';
import { People } from '/imports/people.js';

import _ from 'lodash';

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
    team() {
        let weekend = Template.instance().weekend.get();
        if (weekend) {
            let team = weekend.attendees.filter(function (attendee) {
                return attendee.role.title !== 'Candidate';
            });

            let byRole = _.groupBy(team, function (attendee) {
                return attendee.role.title
                    .replace(/ *.Assistant. */, '')
                    .replace(/.*Professor.*/, 'Professor');
            });

            team = [];
            _.forEach(byRole, function (attendees, roleTitle) {
                team = team.concat(
                    _.orderBy(attendees, ['role.title', 'role.isHead'], ['desc', 'desc'])
                );
            });

            return team;
        }
    },
    candidates() {
        let weekend = Template.instance().weekend.get();
        if (weekend) {
            let candidates = weekend.attendees.filter(function (attendee) {
                return attendee.role.title === 'Candidate';
            }).map(function (attendee) {
                return attendee.person;
            });
            return _.sortBy(candidates, 'table');
        }
    }});

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
