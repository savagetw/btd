import { Template } from 'meteor/templating';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import './gender-filter.html';

Template.genderFilter.helpers({
    genders() {
        return ['Male', 'Female', 'All'];
    }
});

Template.genderFilter.onCreated(function genderFilterOnCreated() {
    this.autorun(() => {
        new SimpleSchema({
            onFilter: { type: Function },
        }).validate(Template.currentData());
    });
});

Template.genderFilter.events({
    'click button'(event, instance) {
        this.onFilter(event.currentTarget.id);
    }
});

export const GenderFilter = {
    weekends(gender) {
        return getGenderQuery(gender, 'gender');
    },
    people(gender) {
        return getGenderQuery(gender && gender.toLowerCase(), 'gender');
    },
    getFilterArgs(reactiveVar) {
        return {
            onFilter (gender) {
                reactiveVar.set(gender);
            }
        }
    }
};

function getGenderQuery(gender, prop) {
    if (!gender || gender === 'All' || gender === 'all') {
        return {};
    }

    let query = {};
    query[prop] = gender;
    return query;
}
