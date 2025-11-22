const mongoose = require('mongoose');

// MongoDB Atlas Configuration - Use environment variables
const dbUser = process.env.DB_USER || 'YOUR_MONGODB_ATLAS_USERNAME'
const password = process.env.DB_PASSWORD || 'YOUR_MONGODB_ATLAS_PASSWORD'
const dbHost = process.env.DB_HOST || 'YOUR_CLUSTER.mongodb.net'
const dbName = process.env.DB_NAME || 'YOUR_DATABASE_NAME'
const dbOptions = process.env.DB_OPTIONS || 'retryWrites=true&w=majority&appName=Schedules'

// Support direct connection string or construct from components
const dbUrl = process.env.MONGODB_URI ||
              process.env.DB_CONNECTION_STRING ||
              `mongodb+srv://${dbUser}:${password}@${dbHost}/${dbName}?${dbOptions}`

mongoose.connect(dbUrl, {
    useNewUrlParser: true
})
.then(()=> console.log("connected to db"))
.catch(err => console.log("not connected to db", err))