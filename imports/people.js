import { Mongo } from 'meteor/mongo';
import { Spacebars } from 'meteor/spacebars';

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

export const ExperienceSchema = new SimpleSchema({
    roleTitle: { type: String },
    weekendGender: { type: String },
    weekendNumber: { type: Number }
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
    emails: { type: [EmailSchema] },
    candidateOn: { type: Number, defaultValue: 0 },
    experiences: { type: [ExperienceSchema]},
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
    phoneList() {
        if (!this.phoneNumbers) {
            return 'No known contact numbers.';
        }

        return this.phoneNumbers.reduce((html, phone) => {
            if (html) {
                html += '<br>';
            }

            let phoneHtml = [
                phone.digits,
                phone.canTxt ? ' (txt)' : '',
                phone.isPreferred ? ' (preferred)' : ''
            ].join('');

            return html + phoneHtml;
        }, '');
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
            preferred = ' "' + this.preferredName + '" ';
        }
        return this.firstName + preferred + this.lastName;
    },
    age() {
        if (!this.birthDate || this.birthDate.valueOf() !== 0) {
            return;
        }
        let ageDifMs = Date.now() - this.birthDate.getTime();
        let ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    },
    addressLabel() {
        if (!this.address || !this.address.city || !this.address.state) {
            return 'Unknown'
        }
        let fullCity = this.address.city + ', ' + this.address.state;
        if (!this.address.street || !this.address.zip) {
            return fullCity;
        }
        return Spacebars.SafeString(this.address.street + '<br>' + fullCity + ' ' + this.address.zip);
    },
    candidateWeekend() {
        if (this.candidateOn === 0) {
            return 'Unknown weekend';
        }
        let gender = capitalizeFirstLetter(this.gender);
        return Spacebars.SafeString([
            '<a href="/weekends/', gender, '/', this.candidateOn, '">',
            gender + ' Weekend #' + this.candidateOn,
            '</a>'].join(''));
    },
    experienceLink(experience) {
        let gender = experience.weekendGender;
        let number = experience.weekendNumber;
        return '<a href="/weekends/' + gender + '/' + number + '">'
            + gender + ' #' + number
            + '</a>';
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

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
