const { Person } = require('../integration/persistance');

class UserService {
    async findAllUsers() {
        return await Person.findAll();
    }

    async getUserById(id) {
        return await Person.findByPk(id);
    }

    async registerUser(data) {
        const { name, surname, pnr, email, password, username } = data;
        
        // Check if username or email already exists
        const existing = await Person.findOne({ 
            where: { username } 
        });
        
        if (existing) {
            throw new Error('Username already exists');
        }
        
        // Create new user (applicant role_id = 2)
        const user = await Person.create({
            name,
            surname,
            pnr,
            email,
            password, // In production, hash this
            username,
            role_id: 2 // Applicant role
        });
        
        return user;
    }

    async loginUser(username, password) {
        const user = await Person.findOne({ 
            where: { username, password } 
        });
        
        if (!user) {
            throw new Error('Invalid credentials');
        }
        
        return user;
    }
}

module.exports = new UserService();