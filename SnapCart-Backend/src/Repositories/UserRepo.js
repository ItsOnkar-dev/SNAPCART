import User from '../Models/User.js'

class UserRepo{
  static async findByUsername(username){
    return await User.findOne({username}).lean();
  }

  static async findByEmail(email){
    return await User.findOne({email}).lean()
  }

  static async findByUserId(userId){
    return await User.findById(userId).lean()
  }

  static async CreateUser(username, hash, email, role){
    return await User.create({username, password: hash, email, role})
  }

  static async updatePassword(userId, newPasswordHash){
    return await User.findByIdAndUpdate(
      userId, 
      { password: newPasswordHash },
      { new: true }
    );
  }

  static async deleteUser(userId) {
    return await User.findByIdAndDelete(userId)
  }
}

export default UserRepo;