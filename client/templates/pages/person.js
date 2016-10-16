import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Weekends } from '/imports/weekends.js';
import { WeekendRoles } from '/imports/weekend-roles.js';
import { People } from '/imports/people.js';

template.person.helpers({
    person() {
        let template = Template.instance();
        template.person.set(People.find({'_id': template._id}).fetch());
    },
    fullName() {
        let template = Template.instance();
        let person = template.person.get();
        if (!person) {
            return 'Unknown';
        }

        let preferred = ' ';
        if (person.preferredName) {
            preferred = ' "' + preferredName + '" ';
        }
        return person.firstName + preferred + person.lastName;
    },
    name(person) {
        return (person.preferredName || person.firstName) + ' ' + person.lastName;
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
