import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { People } from '/imports/people.js';

Template.person.helpers({
    person() {
        let person = Template.instance().person.get();
        if (person && person.experiences) {
            person.groupedExperiences = person.experiences.reduce(function (groups, experience) {
                let role = experience.roleTitle;
                groups[role] = groups[role] || [];
                groups[role].push(experience);
                return groups;
            }, {});
        }

        return person;
    },
    groupedExperiences() {
        let person = Template.instance().person.get();
        return person && person.groupedExperiences && Object.keys(person.groupedExperiences);
    },
    defaultIf(value, defaultValue) {
        return value || defaultValue;
    },
    weekendLinks(roleTitle) {
        let person = Template.instance().person.get();

        console.log('Grouped experiences:', person.groupedExperiences);
        return person.groupedExperiences[roleTitle].reduce(function (html, experience) {
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

Template.person.onCreated(() => {
    let template = Template.instance();
    template._id = FlowRouter.getParam('id');
    template.person = new ReactiveVar();

    template.autorun(() => {
        template.subscribe('person', template._id);

        let person = People.findOne({'_id': template._id});
        if (!person) {
            return;
        }
        template.person.set(person);
        return person;
    });
});
