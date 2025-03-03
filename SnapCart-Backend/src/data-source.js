import mongoose from 'mongoose'

class AppDataSource{
  static async connect(){
    try { 
      await mongoose.connect('mongodb://127.0.0.1:27017/snapcart_db') 
      console.log("Successfully connected to database")
    } catch (error) {
      console.log(error)
    }
}
}

export default AppDataSource;