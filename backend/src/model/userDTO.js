/**
 * UserDTO class representing the data transferred to the View.
 * Rationale: Ensures low coupling and security by hiding internal state.
 */
class UserDTO {
    constructor(id, name, surname, pnr, email, username, role) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.pnr = pnr;
        this.email = email;
        this.username = username;
        this.role = role;
        // Makes sure  DTO is immutable.
        Object.freeze(this);
    }
}

module.exports = UserDTO;