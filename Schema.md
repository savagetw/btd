
# BTD Database Proposed Tables

## Collections
* People
* Churches
* Communities
* Weekends
* CandidateApplications
* MoneyTransactions
* WeekendRoles

---
### Person
* ID (Address)
* First name (Address)
* Last name (Address)
* Preferred Name (Address)
* Gender (Address)
* Birthdate (Address)
* IsPastor (Address)
* ShirtSize (Address)
* Address =::Location (Address)
* Phone Numbers [=::Phone Number] (Address)
* Emails [=::Email] (Address)
* Spouse (Empty, @::Person) (Address)
* Church @::Church (Address)
* BtdStanding (Candidate, Active, Inactive, Deceased, Not Affiliated)


    Old database enum values:
    
    Candidate
    1	Current Applicant
    13	Prospective Candidates
    2	2. W.L Pastor & Spouse
    3	3. W.L Spouse Attended
    4	4. W.L Both to Attend
    5	5. W.L Single limit (10)
    6	6. W.L Church limit (6)
    7	7. W.L Sponsor limit (2)
    
    Active
    8	Pescadore
    9	Worker
    10	Sponsor

    Not Affiliated
    11	Canceled

    Inactive
    12	Inactive Pescadores
    14	Reserved number
    
    Deceased
    15	Deceased

* Sponsor @::Person (Address, get Sponsor#ID, iterate again to resolve)
* Community @::Community

### Location
* Address
* City
* Zip
* Label

### Church
* ID
* Location =::Location
* Pastor @::Person

### Phone Number
* Digits
* IsPreferred
* CanTxt
* Label

### Email
* Email
* IsPreferred

### Community
* ID
* Name
* EstablishedDate
* PreweekendContact @::Person
* LastWeekend @::Weekend
* NextWeekend @::Weekend

### Weekend
* ID
* Community @::Community
* Gender
* WeekendNumber
* SendOffDateTime (Unknown)
* SendOffLocation =::Location (Unknown)
* CandidateFee (Unknown)
* TeamFee (Unknown)
* MaxCandidateCount (Unknown)
* Attendees [=::WeekendAttendance]
* TeamMeetings [=::TeamMeeting] (Unknown)

### WeekendAttendance
* Role =::WeekendRole
* Person @::Person
* IsConfirmed
* DidAttend
* TableName

### WeekendRole
* Title (Team Jobs)
* IsHead (Team Jobs)
* IsProfessor (Team Jobs)

### WeekendRoleRecommendations
* Title
* ExpectedCount
* DefaultSortOrder

### TeamMeeting
* Location =::Location
* MeetingNumber
* Attendees [@::Person]

### CandidateApplication
* ID
* Person @::Person
* ApplicationType   (Pastor and/or Spouse Candidates, Married-both Candidates, Spouse Already Pescadore, Single Candidate)
* ApplicationStatus (Unprocessed, Assigned to Weekend, Unassigned/Wait Listed, Cancelled, Rejected)
* SubmittedDate

### MoneyTransaction
* ID
* Person @::Person
* Amount
* CheckNumber
* Payee
* Weekend @::Weekend
* Note
* Date