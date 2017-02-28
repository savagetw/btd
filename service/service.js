'use strict';

let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let url = require('url');
let path = require('path');

let dataFile = process.env.BTD_DATA_FILE || path.join(__dirname, '..', '/data.json');
let models = require('./models')(dataFile);

app.use('/', express.static('ui'));

app.use(bodyParser.json())

app.get('/hello', function (req, res) {
    res.send('Hello World!')
});

app.get('/people', function (req, res) {
    res.send(models.find('people', req.query.q));
});

app.get('/people/:_id', function (req, res) {
    let found = models.people.byId(parseInt(req.params._id, 10));
    if (found) {
        return res.send(found);
    }
    res.sendStatus(404);
});

app.get('/candidates/:gender', function (req, res) {
    console.log('Here we go');
    res.send(models.people.candidates(req.params.gender));
});

app.post('/auth/login', function (req, res) {
    console.log(`Was given`);
    console.log(req.body);
    models.set('people', 'thom', req.body);
    res.send('oh yeah');
});

app.get('/weekend/:gender', function (req, res) {
    console.log('Hit weekend/:gender');
    res.send(models.weekends.current(req.params.gender));
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

    models.weekends.addAttendee(weekend, person);
    models.people.addExperience(person, weekend);
    res.sendStatus(200);
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

app.listen(8080, '127.0.0.1', () => {
    console.log('Server listening on port 8080.');
});