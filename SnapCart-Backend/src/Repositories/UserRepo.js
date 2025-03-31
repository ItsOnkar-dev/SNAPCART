import User from '../Models/User.js'

class UserRepo{
  static async findByUsername(username){
    return await User.findOne({username})
  }

  static async findByEmail(email){
    return await User.findOne({email})
  }

  static async findByUserId(userId){
    return await User.findById(userId)
  }

  static async CreateUser(username, hash, email, role){
    return await User.create({username, password: hash, email, role})
  }

  static async updatePassword(userId, newPasswordHash){
    try {
      // Assuming you're using MongoDB and mongoose
      // Replace this with your actual database update logic
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { password: newPasswordHash },
        { new: true } // Return the updated document
      );
      
      if (!updatedUser) {
        throw new Error("Failed to update password");
      }
      
      return updatedUser;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }

  static async deleteUser(userId) {
    return await User.findByIdAndDelete(userId)
  }
}

export default UserRepo;