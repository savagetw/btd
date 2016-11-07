import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { People } from '/imports/people.js';

Template.person.helpers({
    person() {
        let person = Template.instance().person.get();
        if (person) {
            person.experiences = person.experiences || [];
            person.groupedExperiences = person.experiences.reduce(function (groups, experience) {
                let role = experience.role.title;
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
        if (!person) {
            return;
        }

        return person.groupedExperiences[roleTitle].reduce(function (html, experience) {
            if (html) {
                html += ', ';
            }

            let gender = experience.weekendGender;
            let number = experience.weekendNumber;
            return html + '<a href="/weekends/' + gender + '/' + number + '">'
                + gender + ' #' + number
                + '</a>'
                + (experience.role.isHead ? '<em>*</em>' : '');
        }, '');
    },
    candidatesSponsored() {
        let template = Template.instance();
        let person = template.person.get();
        if (!person) {
            return;
        }
        let cursor = People.find({'sponsor._id': person._id});
        if (cursor.count()) {
            template.totalSponsored.set(cursor.count());
            return cursor;
        }
    },
    totalSponsored() {
        return Template.instance().totalSponsored.get();
    }
});

Template.person.onCreated(() => {
    let template = Template.instance();
    template.person = new ReactiveVar();
    template.totalSponsored = new ReactiveVar(0);

    template.autorun(() => {
        let _id = FlowRouter.getParam('id');
        template.subscribe('person', _id);

        let person = People.findOne({'_id': _id});
        if (!person) {
            return;
        }
        template.person.set(person);
        template.subscribe('people', {'sponsor._id': person._id});
    });
});
