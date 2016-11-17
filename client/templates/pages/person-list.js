import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { People } from '/imports/people.js';
import { GenderFilter } from '/imports/ui/gender-filter.js';
import { _ } from 'lodash';

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
    },
    genderFilterArgs() {
        return GenderFilter.getFilterArgs(Template.instance().genderFilter);
    }
});

Template.personList.onCreated(() => {
    let template = Template.instance();
    template.searchQuery = new ReactiveVar();
    template.searching = new ReactiveVar(false);
    template.genderFilter = new ReactiveVar();
    template.autorun(() => {
        template.subscribe(
            'people-search', 
            template.searchQuery.get(),
            GenderFilter.people(template.genderFilter.get()), 
            function () {
                setTimeout(() => {
                    template.searching.set(false);
                }, 300);
            }
        );
    });
});

Template.personList.events({
    'keyup [name="search"]'(event, template) {
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
