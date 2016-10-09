import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { People } from '/imports/collections.js';

Template.personList.helpers({
    people() {
        let people = People.find();
        if (people) {
            return people;
        }
    },
    searching() {
        return Template.instance().searching.get();
    },
    query() {
        return Template.instance().searchQuery.get();
    }
});

Template.personList.onCreated(() => {
    let template = Template.instance();

    template.searchQuery = new ReactiveVar();
    template.searching = new ReactiveVar(false);

    template.autorun(() => {
        template.subscribe('people', template.searchQuery.get(), () => {
            setTimeout(() => {
                template.searching.set(false);
            }, 300);
        });
    });
});

Template.personList.events({
    'keyup [name="search"]'(event, template) {
        console.log('search keystroke');
        let value = event.target.value.trim();

        if (value !== '' && event.keyCode === 13) {
            template.searchQuery.set(value);
            template.searching.set(true);
        }

        if (value === '') {
            template.searchQuery.set(value);
        }
    }
});