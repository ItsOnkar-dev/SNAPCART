import app from './app.js'
import AppDataSource from './database/data-source.js'

const PORT = 8000;

const connectDataSource = async () => {
    await AppDataSource.connect()
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

connectDataSource()
