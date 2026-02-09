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
    }
}

module.exports = new UserService();