const userRepo = require('../integration/repositories/userRepo');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { Person } = require('../integration/persistance');

class UserService {
    async findAllUsers() {
        return await Person.findAll();
    }

    async getUserById(id) {
        return await Person.findByPk(id);
    }

    async registerUser(data) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        
        return await userRepo.createUser({
            ...data,
            password: hashedPassword,
            role_id: 2
        });
    }

    async login(username, password) {
        const user = await userRepo.findUserByUsername(username);
        if (!user) throw new Error("Invalid credentials");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        const token = jwt.sign(
            { id: user.person_id, role: user.role_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return { token, user };
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