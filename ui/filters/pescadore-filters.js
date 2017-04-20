define([], function () {
    return [
        {name: 'pescadoreName', filter: pescadoreName},
        {name: 'pescadoreEmail', filter: pescadoreEmail},
        {name: 'pescadorePhone', filter: pescadorePhone}
    ];
});

function pescadoreName() {
    return function (person, isFull) {
        if (!person) {
            return 'Unknown Pescadore';
        }
        
        if (isFull) {
            return `${person.firstName} ${person.preferredName || ''} ${person.lastName}`;
        }

        if (person.preferredName) {
            return `${person.preferredName} ${person.lastName}`;
        }
        return `${person.firstName} ${person.lastName}`;
    };
}

function pescadoreEmail() {
    return function (person) {
        person = person || {};
        return findPreferred(person.emails, 'address') || 'Unknown email';
    };
}

function pescadorePhone() {
    return function (phoneNumber) {
        if (phoneNumber.length !== 10) {
            return phoneNumber;
        }
        var i = 0;
        return ['(',0,0,0,')',' ',0,0,0,'-',0,0,0,0].map(function (elem) {
            return elem || phoneNumber[i++];
        }).join('');
    };
}

function findPreferred(list, fieldName) {
    list = list || [];
    return list.reduce(function (preferred, item) {
        if (item.isPreferred) {
            return item[fieldName];
        }
        return preferred;
    }, undefined);
}