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
    }
});

FlowRouter.route('/weekends/:gender/:weekendNumber', {
    name: 'Weekend.show',
    action() {
        BlazeLayout.render('layout', {
            routeTemplate: 'weekend'
        });
    }
});

FlowRouter.route('/people', {
    name: 'Person.list',
    action() {
        BlazeLayout.render('layout', {
            routeTemplate: 'personList'
        });
    }
});

FlowRouter.renderNotFound = () => {
    BlazeLayout.render('layout', { routeTemplate: 'notFound', title: 'Oops!'});
};

FlowRouter.notFound = {
    action() {
        FlowRouter.renderNotFound();
    }
};

