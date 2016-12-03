import { Template } from 'meteor/templating';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Session } from 'meteor/session';
import './gender-filter.html';

Template.genderFilter.helpers({
    genders() {
        return ['Male', 'Female', 'All'];
    },
    selected(gender) {
        let current = Session.get('genderFilter');
        if (current && gender == current) {
            return 'disabled';
        }
        return '';
    }
});

Template.genderFilter.onCreated(function genderFilterOnCreated() {
    this.autorun(function (autorun) {
        let currentData = Template.currentData();
        new SimpleSchema({
            onFilter: { type: Function },
        }).validate(currentData);

        let current = Session.get('genderFilter');
        if (current) {
            currentData.onFilter(current);
        }
        autorun.stop();
    });
});

Template.genderFilter.events({
    'click button'(event, instance) {
        Session.set('genderFilter', event.currentTarget.id);
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
