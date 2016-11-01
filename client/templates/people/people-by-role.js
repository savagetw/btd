import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker'
import { WeekendRoles } from '/imports/weekend-roles.js';
import { People } from '/imports/people.js';

Template.peopleByRole.helpers({
    people() {
        let role = Template.instance().selectedRole.get();
        if (!role) {
            return;
        }

        let elemMatch = {$elemMatch: {roleTitle: role}};
        return People.find({
            experiences: elemMatch
        });
    },
    roles() {
        return WeekendRoles.find({}, { sort: { title: 1 } });
    },
    experienceLinks(person) {
        let roleTitle = Template.instance().selectedRole.get();
        let matches = person.experiences.filter(function (experience) {
            return experience.roleTitle === roleTitle;
        });

        return matches.reduce(function (html, experience) {
            if (html) {
                html += ', ';
            }

            let gender = experience.weekendGender;
            let number = experience.weekendNumber;
            return html + '<a href="/weekends/' + gender + '/' + number + '">'
                + gender + ' #' + number
                + '</a>';
        }, '');
    }
});

Template.peopleByRole.onCreated(function () {
    let template = this;
    template.selectedRole = new ReactiveVar();
    template.autorun(() => {
        template.subscribe('weekendRoles', function () {
            Tracker.afterFlush(function () {
                template.$('select').material_select();
            });
        });

        template.subscribe('people');
    });
});

Template.peopleByRole.events({
    'change [name="role"]'(event, template) {
        Template.instance().selectedRole.set(event.target.value);
    }
});
