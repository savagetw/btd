import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

import './templates/pages/home.html';
import './templates/pages/weekend-list.html';
import './templates/pages/weekend.html';
import './templates/pages/person-list.html';
import './templates/pages/not-found.html';

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

FlowRouter.route('/people/:subview?', {
    name: 'Person.list',
    action() {
        BlazeLayout.render('layout', {
            routeTemplate: 'personList'
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
