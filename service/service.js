'use strict';

let express = require('express');
let session = require('express-session')
let app = express();
let fs = require('fs');
let bodyParser = require('body-parser');
let url = require('url');
let path = require('path');
var https = require('https');
var http = require('http');

let config = require('../config.json');
let models = require('./models')(config);

app.use('/', express.static(path.join(__dirname, '..', 'ui')));

app.use(session({
  secret: '--btd-session--',
  resave: false,
  saveUninitialized: true
}));

app.use(function (req, res, next) {
    if (req.url === '/auth' && req.method === 'POST') {
        return next();
    }

    if (req.session && req.session.authenticated) {
        // Client check to determine if still authenticated
        if (req.url === '/auth' && req.method === 'GET') {
            res.send('ok');
            return;
        }
        return next();
    }
 
    res.sendStatus(403);
});

app.use(bodyParser.json());

app.post('/auth', function (req, res) {
    if (req.body && models.users.auth(req.body.username, req.body.password)) {
        req.session.authenticated = true;
        console.log('Logged in user "' + req.body.username + '" from ' + req.connection.remoteAddress);
        res.send('Access granted.');
        return;
    }

    res.status(403).send('Access denied.');
});

app.get('/people', function (req, res) {
    if (req.query.q) {
        res.send(models.find('people', req.query.q));
    } else if (req.query.sponsoredBy) {
        res.send(models.people.sponsoredBy(parseInt(req.query.sponsoredBy, 10)));
    } else {
        res.send(models.get('people'));
    }
});

app.get('/people/:_id', function (req, res) {
    let found = models.people.byId(parseInt(req.params._id, 10));
    if (found) {
        return res.send(found);
    }
    res.sendStatus(404);
});

app.get('/people/experiences/:_id', function (req, res) {
    res.send(models.people.withExperience(parseInt(req.params._id, 10)));
});

app.get('/candidates/:gender', function (req, res) {
    res.send(models.people.candidates(req.params.gender));
});

app.get('/weekend/:gender', function (req, res) {
    if (req.query.current === 'true') {
        res.send(models.weekends.current(req.params.gender));
    } else {
        res.send(models.weekends.list(req.params.gender));
    }
});

app.get('/weekend/:gender/:weekendNumber', function (req, res) {
    res.send(models.weekends.get(req.params.gender, parseInt(req.params.weekendNumber, 10)));
});

app.post('/weekend/:gender/:weekendNumber/attendee/:id', function (req, res) {
    let person = models.people.byId(parseInt(req.params.id, 10));
    if (!person) {
        res.send(500, 'Person not found.');
        return;
    }

    let weekend = models.weekends.get(req.params.gender, parseInt(req.params.weekendNumber, 10));
    if (!weekend) {
        res.send(500, 'Weekend not found.');
        return;
    }

    let role = models.roles.byId(parseInt(req.body._id, 10)) || {};
    models.weekends.addAttendee(weekend, person, role);
    models.people.addExperience(person, weekend, role);
    res.sendStatus(200);
});

app.delete('/weekend/:gender/:weekendNumber/attendee/:id', function (req, res) {
    let person = models.people.byId(parseInt(req.params.id, 10));
    if (!person) {
        res.send(500, 'Person not found.');
        return;
    }

    let weekend = models.weekends.get(req.params.gender, parseInt(req.params.weekendNumber, 10));
    if (!weekend) {
        res.send(500, 'Weekend not found.');
        return;
    }

    models.weekends.removeAttendee(weekend, person);
    models.people.removeExperience(person, weekend);
    res.sendStatus(200);
});

app.get('/roles', function (req, res) {
    res.send(models.roles.get(req.query.assignable === 'true'));
});

app.get('/roles/:id', function (req, res) {
    res.send(models.roles.byId(parseInt(req.params.id, 10)));
});

app.get('/admin', function (req, res) {
    res.send({
        meta: models.meta.get(),
        current: {
            male: models.weekends.current('male'),
            female: models.weekends.current('female')
        }
    });
});

app.post('/admin', function (req, res) {
    switch(req.body.command) {
        case 'weekend.add':
            res.send(models.weekends.add(parseInt(req.body.weekendNumber, 10)));
            break;
        case 'weekend.setCurrent':
            res.send(models.weekends.setCurrentWeekendNumber(parseInt(req.body.weekendNumber, 10)));
            break;
    }
});

let server;
if (config.ssl) {
    let securityOptions = {
        cert: fs.readFileSync(path.join(__dirname, '..', config.ssl.certificate)),
        key: fs.readFileSync(path.join(__dirname, '..', config.ssl.key))
    };
    console.log(`Server is using HTTPS. Certificate=${config.ssl.certificate}, Key=${config.ssl.key}`);
    server = https.createServer(securityOptions, app);
} else {
    console.log('Server is using unsecure HTTP');
    server = http.createServer(app);
}

server.listen(config.port, config.host || '127.0.0.1', () => {
    console.log(`Server listening on port ${config.port}`);
});