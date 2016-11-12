# BTD (Meteor)

This is a Meteor.js app for managing the BTD community database.

## Quick start

Install Meteor, checkout, do a `meteor run`.

## Importing Migrated Database

```
C:\Users\savagetw\Source\btd-migrate\output>"\Program Files\MongoDB\Server\3.2\bin\mongoimport.exe" --host localhost:3001 --collection weekends --db meteor --jsonArray --file weekends.json
2016-10-20T22:14:33.396-0500    connected to: localhost:3001
2016-10-20T22:14:33.496-0500    imported 70 documents

C:\Users\savagetw\Source\btd-migrate\output>"\Program Files\MongoDB\Server\3.2\bin\mongoimport.exe" --host localhost:3001 --collection weekendRoles --db meteor --jsonArray --file weekend-roles.json
2016-10-20T22:14:42.852-0500    connected to: localhost:3001
2016-10-20T22:14:42.855-0500    imported 47 documents

C:\Users\savagetw\Source\btd-migrate\output>"\Program Files\MongoDB\Server\3.2\bin\mongoimport.exe" --host localhost:3001 --collection people --db meteor --jsonArray --file people.json
2016-10-20T22:14:54.510-0500    connected to: localhost:3001
2016-10-20T22:14:54.720-0500    imported 2816 documents
```

## Production deployment

```
Deploy local build to production hosting:
cmd>  meteor build ..\ --architecture os.linux.x86_64
bash> scp btd-meteor.tar.gz btdapp@btresdias.org:.
bash> ssh btdapp@btresdias.org
btdapp@btresdias.org> tar xzf btd-meteor.tar.gz
btdapp@btresdias.org> (cd bundle/programs/server && ~/node*/bin/npm install)
```

```
Service management on production hosting:
bash> ssh root@btresdias.org /etc/init.d/btdapp restart
```

## User Stories for the BTD Rector Access Database Application

### I'm a rector developing my team list, I need to...

...set my weekend verse and tagline so they are included in the name tags and dorm labels.
* Accepts a weekend verse and tagline (to be included in some reports such as name tags)

...generate reports to help me pick my team.
* List of people qualified for a certain position (e.g. Head/Asst. Head Qualified)
* List of people who have served within a time range (e.g. Worked Last 2 Weekends)
* List of people and their respective work history
* List of positions and the people who have worked them
* List of current team members and their respective work history
* List of positions and current team members who have worked them

...make changes to my current team list assignments.
* Assign existing people from community to a position on the current team
* Remove someone from the current team
* Track communication attempts to team members: Answered, No Answer, Left Message, Sent Email, Sent Txt
* View current team
    * Sort the view of current team by position or name
    * View overall counts of current section assignments (e.g. 9 people currently in Dorm)
    * View team member contact details directly
* Create a list of back-up professor assignments


### I'm a rector/head responsible for managing my selected team, I need to...
 
...provide lists of team members to my heads for contact.
* Report contact details for team members sorted by last name
* Report contact details for team members sorted by position
* Send e-mail with included team list to relevant groups of team members (heads, sections, etc.)

...ensure that everyone on the team has paid their team fees.
* Balance sheet report. Lists team members with their collected payments and outstanding balance.
* Printable balance sheet report. Provides a worksheet for use in hand-collecting payment (e.g. at the weekend checkin)

...contact team members who haven't made it to any of the meetings yet.
* Send e-mail to specific team members
* Attendance sheet. Lists the meetings and who has or has not attended any meetings.

...print the team member name tags for use on the weekend.
* Name tag printouts. Provides printable sheets of name tags with verses and tag lines.

...ensure that everyone arrives on the weekend.
* Check-in sheets. Provides a one sheet checklist of names for each section head to use for weekend verification.


### I'm the dorm section head, I need to...

...know where to bunk people based on age and special considerations.
* Dorm planning list. Provides list of team members with ages and notes, sorted by section.
* Dorm label printouts. Provides printable labels for use in bunk assignments.


### I'm an assistant head using the database for team meeting check-ins, I need too...

...track attendance.
* Allows marking a team member as having attended a meeting

...accept payments.
* Allows for accepting a payment from a team member, tracking the payment amount, type (cash/check), check #.

...take the opportunity to make sure the team member's contact info is correct.
* Provides a pop-up screen for a checking-in team member to verify their contact information


### I'm the head prayer cha, I need to...

...track which prayer coin is assigned to which team member.
* Allows for input of a prayer coin # assignment for each team member