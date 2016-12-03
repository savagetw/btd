import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import './ui/pages/home.js';
import './ui/pages/weekend-list.js';
import './ui/pages/weekend.js';
import './ui/pages/person-list.js';
import './ui/pages/person.js';
import './ui/pages/experience-list.js';
import './ui/pages/not-found.js';

FlowRouter.route('/', {
    name: 'Main',
    action() {
        BlazeLayout.render('layout', {
            routeTemplate: 'home'
        });
    }
})

FlowRouter.route('/weekends', {
    name: 'Weekend.list',
    action() {
        BlazeLayout.render('layout', {
            routeTemplate: 'weekendList'
        });
    },
    triggersEnter: [isAuthenticated]
});

FlowRouter.route('/weekends/:gender/:weekendNumber', {
    name: 'Weekend.show',
    action() {
        BlazeLayout.render('layout', {
            routeTemplate: 'weekend'
        });
    },
    triggersEnter: [isAuthenticated]
});

FlowRouter.route('/people', {
    name: 'Person.list',
    action() {
        BlazeLayout.render('layout', {
            routeTemplate: 'personList'
        });
    },
    triggersEnter: [isAuthenticated]
});

FlowRouter.route('/experience/:roleTitle?', {
    name: 'Experience',
    action() {
        BlazeLayout.render('layout', {
            routeTemplate: 'experienceList'
        });
    },
    triggersEnter: [isAuthenticated]
});

FlowRouter.route('/person/:id', {
    name: 'Person.show',
    action() {
        BlazeLayout.render('layout', {
            routeTemplate: 'person'
        });
    },
    triggersEnter: [isAuthenticated]
});

FlowRouter.renderNotFound = () => {
    BlazeLayout.render('layout', { routeTemplate: 'notFound', title: 'Oops!'});
};

FlowRouter.notFound = {
    action() {
        FlowRouter.renderNotFound();
    }
};

function isAuthenticated(context, redirect) {
    var user = Meteor.user();
    if (!user || user.username !== 'admin@btresdias.org') {
        redirect('/');
    }
}
