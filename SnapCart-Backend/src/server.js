import dotenv from 'dotenv';
import app from './app.js';
import Logger from './Config/Logger.js';
import AppDataSource from './Database/data-source.js';

dotenv.config();

const PORT = process.env.PORT || 5555;

const connectDataSource = async () => {
    await AppDataSource.connect()
    app.listen(PORT, () => {
        Logger.info(`Server is running on port ${PORT}`)
    })
}

connectDataSource()
