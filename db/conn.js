const mongoose = require('mongoose')
require('dotenv').config();

async function main() {
    mongoose.set('strictQuery', false)
    const dbUri = process.env.NODE_ENV === 'test'
        ? (process.env.DBLINK_TEST || 'mongodb://localhost:27017/pet-adopt-test')
        : process.env.DBLINK;
        
    await mongoose.connect(dbUri)

    if (process.env.NODE_ENV !== 'test') {
        console.log("conectado ao BD")
    }
}

main().catch((err) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(err)
    }
})

module.exports = mongoose
