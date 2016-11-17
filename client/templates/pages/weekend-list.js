import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Weekends } from '/imports/weekends.js';
import { GenderFilter } from '/imports/ui/gender-filter.js';

Template.weekendList.helpers({
    weekends() {
        let template = Template.instance();
        let query = GenderFilter.weekends(template.genderFilter.get());
        let weekends = Weekends.find(query, {sort: {weekendNumber: -1}});
        if (weekends) {
            return weekends;
        }
    },
    genderFilterArgs() {
        return GenderFilter.getFilterArgs(Template.instance().genderFilter);
    }
});

Template.weekendList.onCreated(() => {
    let template = Template.instance();
    template.genderFilter = new ReactiveVar();
    template.autorun(() => {
        template.subscribe('weekends');
    });
});
