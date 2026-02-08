/**
 * Rationale: Ensures the View only receives necessary data, 
 * maintaining low coupling between the DB schema and the Frontend.
 */
class ApplicationDTO {
    constructor(firstName, lastName, status) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.status = status; // e.g unhandled, accepted, rejected
        Object.freeze(this);
    }
}

module.exports = ApplicationDTO;