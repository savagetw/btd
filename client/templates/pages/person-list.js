import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { People } from '/imports/people.js';

Template.personList.helpers({
    subview() {
        var subview = FlowRouter.getParam('subview');
        switch (subview) {
            case 'by-role':
                return 'peopleByRole';
            case 'by-name':
            default:
                return 'peopleByName';
        }
    }
});
