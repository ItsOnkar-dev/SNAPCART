import User from '../Models/User.js'

class UserRepo{
  static async findByUsername(username){
    return await User.findOne({username})
  }

  static async findByEmail(email){
    return await User.findOne({email})
  }

  static async CreateUser(username, hash, email){
    return await User.create({username, password: hash, email})
  }
}

export default UserRepo;