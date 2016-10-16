import { Mongo } from 'meteor/mongo';

export const LocationSchema = new SimpleSchema({
    street: { type: String, max: 150 },
    city: { type: String, max: 100 },
    state: { type: String, max: 100, optional: true },
    country: { type: String, max: 100 },
    zip: { type: String, regEx: SimpleSchema.RegEx.ZipCode, optional: true },
    label: { type: String, max: 100, optional: true }
});

export const PhoneNumberSchema = new SimpleSchema({
    digits: { type: Number },
    isPreferred: { type: Boolean },
    canTxt: { type: Boolean }
});

export const EmailSchema = new SimpleSchema({
    address: { type: String, regEx: SimpleSchema.RegEx.Email },
    isPreferred: { type: Boolean }
});

export const ChurchSchema = new SimpleSchema({
    location: { type: LocationSchema },
    pastorPersonId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true }
});

export const PersonSchema = new SimpleSchema({
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
    address: { type: LocationSchema },
    phoneNumbers: { type: [PhoneNumberSchema] },
    emailAddresses: { type: [EmailSchema] },
    createdAt: {
        type: Date,
        denyUpdate: true
    }
});

export const People = new Mongo.Collection('people');
People.attachSchema(PersonSchema);

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
        if (!this.address || !this.address.city || !this.address.state) {
            return 'Unknown'
        }
        return this.address.city + ', ' + this.address.state;
    },
    fullName() {
        let preferred = ' ';
        if (this.preferredName) {
            preferred = ' "' + preferredName + '" ';
        }
        return this.firstName + preferred + this.lastName;
    }
});

if (Meteor.isServer) {
    People._ensureIndex({ lastName: 1 });
}

function findPreferred(list, fieldName) {
    var preferred;
    if (list) {
        list.forEach(function (item) {
            if (item.isPreferred) {
                preferred = item[fieldName];
            }
        });
    }
    return preferred;
}
