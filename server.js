const express = require('express')
const dotenv = require('dotenv')
const helmet = require('helmet')
const cors = require('cors')
const path = require('path')
const db = require('./models/index.js')
const errorHandler = require('./middlewares/error.js')


//Initial env variables
dotenv.config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(helmet())

// Make the public folder static
app.use(express.static(path.join(__dirname, 'public')))

app.use(cors({ origin: ["http://localhost:8080", "http://192.168.1.6:8080", "http://helptech.uz"] }));

// //  CORS error disable
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*')
//     res.setHeader('Access-Control-Allow-Method', 'GET, POST, PUT, PATCH, DELETE')
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
//     next()
// })

//Initialize routes
app.use('/api/v1/auth', require('./routes/user.route.js'))
app.use('/api/v1/zone', require('./routes/zone.route.js'))
app.use('/api/v1/parameter', require('./routes/parameter.route.js'))



// Error handler middleware registration
app.use(errorHandler)


const PORT = process.env.PORT || 3000
const start = async () => {
    try {
        const connect = await db.sequelize.sync()
        // const connect = await db.sequelize.sync({force: true})  
        // this line includes: force: true which is used when new table added and associated with an existing table in development mode
        

        app.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`)
        })      

    } catch (error) {
        console.log(error)
    }
}

start()