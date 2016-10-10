import { Mongo } from 'meteor/mongo';

export const WeekendAttendance = new SimpleSchema({
    personId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    roleId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    isConfirmed: {type: Boolean},
    didAttend: {type: Boolean}
});

export const WeekendSchema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    weekendNumber: {type: Number },
    community: { type: String, max: 100 },
    gender: { type: String, max: 100 },
    attendees: { type: [WeekendAttendance]}
});

export const Weekends = new Mongo.Collection('weekends');
Weekends.attachSchema(WeekendSchema);

Weekends.helpers({
    attendeeCount: function () {
        return this.attendees.length;
    }
});
