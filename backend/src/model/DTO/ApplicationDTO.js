/**
 * DTO for applications, used to transfer data between the backend and frontend
 * Maintains low coupling between the DB schema and the Frontend.
 */
class ApplicationDTO {
  constructor({ applicationId, personId, personNumber, fullName, status, competenceProfiles, availabilities }) {
    this.applicationId = applicationId;
    this.personId = personId;
    this.personNumber = personNumber;
    this.fullName = fullName;
    this.status = status;
    this.competenceProfiles = competenceProfiles;
    this.availabilities = availabilities;
    Object.freeze(this);
  }
}
module.exports = ApplicationDTO;
