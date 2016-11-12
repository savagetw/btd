import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Weekends } from '/imports/weekends.js';

Template.weekendList.helpers({
    weekends() {
        let weekends = Weekends.find({}, {sort: {weekendNumber: -1}});
        if (weekends) {
            return weekends;
        }
    }
});

Template.weekendList.onCreated(() => {
    let template = Template.instance();
    template.autorun(() => {
        template.subscribe('weekends');
    });
});
