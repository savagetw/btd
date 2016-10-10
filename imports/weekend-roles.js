import { Mongo } from 'meteor/mongo';

export const WeekendRoleSchema = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    title: { type: String, max: 100 },
    isHead: { type: Boolean },
    isProfessor: { type: Boolean }
});

export const WeekendRoles = new Mongo.Collection('weekend-roles');
WeekendRoles.attachSchema(Schemas.WeekendRoleSchema);
