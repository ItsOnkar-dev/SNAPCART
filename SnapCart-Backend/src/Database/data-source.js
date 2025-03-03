import mongoose from 'mongoose'

class AppDataSource{
  static async connect(){
    try { 
      await mongoose.connect('mongodb://127.0.0.1:27017/snapcart_db') 
      console.log("Successfully connected to database")
    } catch (error) {
      console.log(error, "error while connected to database")
    }
}
}

export default AppDataSource;

// Why to use static:

// Without static:
// If we remove static, we'd need to create an instance before calling the method:

// class AppDataSource {
//   async connect() {
//     try {
//       await mongoose.connect('mongodb://127.0.0.1:27017/snapcart_db');
//       console.log('Successfully connected to database');
//     } catch (error) {
//       console.error('Error while connecting to database:', error);
//     }
//   }
// }

// const db = new AppDataSource();
// db.connect();

// This is unnecessary overhead since we don't need multiple instances of a database connection class.

// Using static makes the method directly accessible via the class itself, making it more convenient and appropriate for managing a single database connection. 