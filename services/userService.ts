import userRepository from '../repository/userRepository';

class UserService {
    async getProfile(userId: string) {
        return userRepository.findById(userId);
    }

    async updateProfile(userId: string, updateData: any) {
        return userRepository.updateUser(userId, updateData);
    }
}

export default new UserService();
