
class UserService {
    async findAllUsers() {
        return [];
    }

    async getUserById(id) {
        return null;
    }

    async registerUser(data) {
        return { id: 1, ...data, role_id: 2 };
    }
}

module.exports = new UserService();