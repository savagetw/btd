import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { People } from '/imports/people.js';

Template.person.helpers({
    person() {
        let template = Template.instance();
        let person = People.findOne({'_id': template._id});
        template.person.set(person);
        return person;
    }
});

Template.person.onCreated(() => {
    let template = Template.instance();
    template._id = FlowRouter.getParam('id');
    template.person = new ReactiveVar();

    template.autorun(() => {
        template.subscribe('person', template._id);
    });
});
