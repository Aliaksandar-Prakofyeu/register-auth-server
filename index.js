const express = require('express')
require('dotenv').config()
const sequelize = require('./db')
const models = require('./models/models')
const app = express()
const PORT = process.env.PORT || 8080
const router = require('./routes/user.routes')
const cors = require('cors')


app.use(cors())
app.use(express.json())
app.use('/api', router)

app.get('/', (req, res) => {
    res.status(200).json({message: 'Working!'})
})

const start = async () => {
    try{
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () =>console.log(`Server started on port ${PORT}`))
    } catch (e){
        console.log(e)
    }
}

start()