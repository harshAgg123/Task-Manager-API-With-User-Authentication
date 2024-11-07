const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const DB_NAME=process.env.DB_NAME;
mongoose.connect(uri,{
  dbName:DB_NAME
}).then(
  ()=>{
    console.log('Connected to database');
  }
).catch((err)=>{
  console.log('Error connecting to database'+err);
})
