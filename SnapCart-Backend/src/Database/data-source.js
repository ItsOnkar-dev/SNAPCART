import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Logger from '../Config/Logger.js';

dotenv.config();

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/SnapCart_DB';

class AppDataSource {
  static async connect() {
    try {
      await mongoose.connect(DB_URL);
      Logger.info("Successfully connected to database");
    } catch (error) {
      Logger.error("DB connection failed", { error });
      throw new Error("Could not connect to DB: " + error.message);
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