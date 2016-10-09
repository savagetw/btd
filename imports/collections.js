import { Mongo } from 'meteor/mongo';

export const Schemas = {};
Schemas.Location = new SimpleSchema({
    street: { type: String, max: 150 },
    city: { type: String, max: 100 },
    state: { type: String, max: 100, optional: true },
    country: { type: String, max: 100 },
    zip: { type: String, regEx: SimpleSchema.RegEx.ZipCode, optional: true },
    label: { type: String, max: 100, optional: true }
});

Schemas.PhoneNumber = new SimpleSchema({
    digits: { type: Number },
    isPreferred: { type: Boolean },
    canTxt: { type: Boolean }
});

Schemas.Email = new SimpleSchema({
    address: { type: String, regEx: SimpleSchema.RegEx.Email },
    isPreferred: { type: Boolean }
});

Schemas.Church = new SimpleSchema({
    location: { type: Schemas.Location },
    pastorPersonId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true }
});

Schemas.Person = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    firstName: { type: String, max: 100 },
    lastName: { type: String, max: 100 },
    preferredName: { type: String, max: 100 },
    gender: { type: String, allowedValues: ['male', 'female'] },
    birthDate: { type: Date },
    isPastor: { type: Boolean, defaultValue: false },
    shirtSize: { type: String, allowedValues: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'], defaultValue: 'XL' },
    address: { type: Schemas.Location },
    phoneNumbers: { type: [Schemas.PhoneNumber] },
    emailAddresses: { type: [Schemas.Email] },
    createdAt: {
        type: Date,
        denyUpdate: true
    }
});

export const People = new Mongo.Collection('people');
People.attachSchema(Schemas.Person);

People.helpers({
    name() {
        return (this.preferredName || this.firstName) + ' ' + this.lastName;
    },
    email() {
        return findPreferred(this.emails, 'address') || 'Unknown email';
    },
    phone() {
        return findPreferred(this.phoneNumbers, 'digits') || 'Unknown phone';
    },
    fullCity() {
        if (!this.address.city || !this.address.state) {
            return 'Unknown'
        }
        return this.address.city + ', ' + this.address.state;
    }
});

if (Meteor.isServer) {
    People._ensureIndex({ lastName: 1 });
}

function findPreferred(list, fieldName) {
    var preferred;
    list.forEach(function (item) {
        if (item.isPreferred) {
            preferred = item[fieldName];
        }
    });
    return preferred;
}
