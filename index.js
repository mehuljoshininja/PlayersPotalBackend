//Importing
var express = require('express')
var mongoose = require('mongoose')
var chalk = require('chalk')
const bodyParser = require('body-parser')
var cors = require('cors')

var app = express()
var router = express.Router()
app.use(express.json())
app.use(cors())
app.use(bodyParser.json());
app.use('/uploads',express.static('uploads'))

//Schema
var User = require('./Routs/User')
var Player = require('./Routs/Player')

//Routs
app.use('/user', User)
app.use('/player', Player)
app.use(router)


//Mongodb Connection
mongoose.connect('mongodb://localhost:27017/NodeAPI', {})
mongoose.connection.on('error', (error) => {
  console.log(chalk.red('Error While Connecting To DB : ', error))
}).once('open', () => {
  console.log(chalk.green('DB Connection Successfully.....'))
})

//Listner
app.listen(3000, () => {
  console.log(chalk.blue("server hosted At http://localhost:3000"))
})