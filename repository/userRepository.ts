import User from '../models/User';

class UserRepository {

    async findByMobile(mobile: string) {
        return User.findOne({ mobile });
    }

    async createUser(userData: any) {
        return User.create(userData);
    }

    async findById(id: string) {
        return User.findById(id).select('-password');
    }

    async updateUser(id: string, updateData: any) {
        return User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    }
}

export default new UserRepository();
