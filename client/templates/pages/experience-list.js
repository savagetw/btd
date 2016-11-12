import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Tracker } from 'meteor/tracker'
import { WeekendRoles } from '/imports/weekend-roles.js';
import { People } from '/imports/people.js';
import { _ } from 'lodash';

Template.experienceList.helpers({
    people() {
        let roleTitle = Template.instance().selectedRoleTitle.get();
        if (!roleTitle) {
            return;
        }

        let people = People.find({
            experiences: {$elemMatch: {'role.title': roleTitle}}
        }).fetch();

        if (!people) {
            return;
        }

        people.forEach(function (person) {
            let matches = person.experiences.filter(function (experience) {
                return experience.role.title === roleTitle;
            });

            person.workedCount = matches.length;
            person.headCount  = matches.reduce(function (count, match) {
                if (match.role.isHead) {
                    count++;
                }
                return count;
            }, 0);
        });

        return _.orderBy(people, ['workedCount', 'headCount'], ['desc', 'desc']);
    },
    roles() {
        let roles = WeekendRoles.find({title: {$ne: 'Candidate'}}, { sort: { title: 1 } }).fetch();
        if (!roles) {
            return;
        }

        return _.uniq(_.map(roles, 'title'));
    }
});

Template.experienceList.onCreated(function () {
    let template = this;
    template.selectedRoleTitle = new ReactiveVar();
    template.autorun(() => {
        template.subscribe('weekendRoles', function () {
            Tracker.afterFlush(function () {
                template.$('select').material_select();
            });
        });

        let roleTitle = FlowRouter.getParam('roleTitle');
        if (roleTitle) {
            template.subscribe('people', {});
            Template.instance().selectedRoleTitle.set(roleTitle);
        }
    });
});

Template.experienceList.events({
    'change [name="role"]'(event, template) {
        FlowRouter.go('Experience', {roleTitle: event.target.value});
    }
});
