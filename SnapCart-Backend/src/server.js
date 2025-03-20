import app from './app.js'
import AppDataSource from './database/data-source.js'
import Logger from './Core/Logger.js'

const PORT = 8000;

const connectDataSource = async () => {
    await AppDataSource.connect()
    app.listen(PORT, () => {
        Logger.info(`Server is running on port ${PORT}`)
    })
}

connectDataSource()
