import mongoose from 'mongoose'
import Logger from '../Config/Logger.js'
import dotenv from 'dotenv'

dotenv.config()

const DB_URL = process.env.DB_URL

class AppDataSource{
  static async connect(retries = 5) {
    while (retries) {
      try {
        await mongoose.connect(DB_URL || 'mongodb://localhost:27017/SnapCart_DB') 
        Logger.info("Successfully connected to database")
        break;
      } catch (error) {
        Logger.error("DB connection failed, retrying...", { error });
        retries -= 1;
        await new Promise(res => setTimeout(res, 5000));
      }
    }
    if (!retries) throw new Error("Could not connect to DB after multiple attempts");
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