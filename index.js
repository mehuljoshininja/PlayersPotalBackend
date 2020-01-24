//Importing
var mongoose = require('mongoose')
var chalk = require('chalk')
var jwt = require('jsonwebtoken')
var fs = require('fs')
const bodyParser = require('body-parser')
const multer = require('multer');
var cors = require('cors')


var express = require('express')
var app = express()
app.use(express.json())
var router = express.Router()
app.use(cors())
var User = require('./Routs/User')
var Player = require('./Routs/Player')
// app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());
app.use('/user', User)
app.use('/player', Player)
// app.use('/player', Player)
app.use(router)
router.use('/uploads', express.static('uploads'));

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10000000, files: 1 },
  fileFilter: (req, file, callback) => {
    console.log(file)
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error('Only Images are allowed !'), false)
    }
    callback(null, true);
  }
}).single('image')

app.post('/images/upload', (req, res) => {

  upload(req, res, function (err) {
    if (err) {
      res.status(400).json({ message: err.message })
    } else {

      //let path = `/uploads/${req.file.filename}`;

      var user = new User({
        username: 'ABC',
        img: req.file.filename
      });
      user.save().then(data => {
        res.status(200).json({ message: 'Image Uploaded Successfully !' })
      }).catch(error => {
        res.status(400).json(error)
      })
    }
  })
})

// app.get('/uploads/:imagename', (req, res) => {

//   let imagename = req.params.imagename
//   let imagepath = __dirname + "/uploads/" + imagename
//   let image = fs.readFileSync(imagepath)
//   res.end(image, 'binary')
// })

app.post('/uploads/', (req, res) => {

  let id = req.body.id

  User.findById(id, (error, data) => {
    if (error) {
      return res.send('Invalid Id')
    }
    else {
      if (data) {
        let imagepath = __dirname + "/uploads/" + data.img
        let image = fs.readFileSync(imagepath)
        return res.end(image, 'binary')
      }
      return res.send('No Records Found')
    }
  });
})

app.use((err, req, res, next) => {
  if (err.code == 'ENOENT') {
    res.status(404).json({ message: 'Image Not Found !' })
  } else {
    res.status(500).json({ message: err.message })
  }
})

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