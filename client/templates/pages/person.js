import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { People } from '/imports/people.js';

Template.person.helpers({
    person() {
        return Template.instance().person.get();
    },
    experiences() {
        let person = Template.instance().person.get();
        if (!person || !person.experience) {
            return;
        }

        return Object.keys(person.experience).map(function (weekendLabel) {
            return {
                weekendLabel: weekendLabel,
                role: person.experience[weekendLabel]
            };
        });
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
