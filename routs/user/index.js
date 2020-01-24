var express = require('express')
var mongoose = require('mongoose')
var chalk = require('chalk')
var jwt = require('jsonwebtoken')
var multer = require('multer')
// var bcrypt = require('bcryptjs')
var cors = require('cors')
var path = require('path')
var router = express.Router()

var User = require('../../schema/User.js')

var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  });
  var upload = multer({ storage : storage}).single('profile');

// const upload = multer({
//     dest:`${__dirname}/uploads/`, 
//     limits: {fileSize: 10000000, files: 1},
//     fileFilter:  (request, file, callback) => {
//     //console.log(file)
//         if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//             return callback(new Error('Only Images are allowed !'), false)
//         }
//         callback(null, true);
//     }
//   }).single('profile')

//   const uploadmulti = multer({
//     dest:`${__dirname}/uploads/`, 
//     limits: {fileSize: 10000000, files: 10},
//     fileFilter:  (request, file, callback) => {
//     console.log(file)
//         if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//             return callback(new Error('Only Images are allowed !'), false)
//         }
//         callback(null, file.originalname);
//     }
//   })


// router.post('/test', uploadmulti.array('image',10),(request, response) => {
//     let path = __dirname + `/uploads/`
//     // response.send(request.files)
//     let img = []
//     request.files.map( (f) => {
//         let imagepath = path + f.filename
//         //response.send(imagepath)
//         let image = (fs.readFileSync(imagepath))
//         // response.end(image)
//         //response.write((fs.readFileSync(imagepath)))
//         img.push(fs.readFileSync(imagepath))
//     })
//     // response.write(img[0])
//     response.write(img[0],'binary')
//     response.end(img[1])
// })

router.post('/register' , async (request, response) => {

    //user.password = await bcrypt.hash(request.body.password, 8)   
    upload(request, response, function (error) {
        let body = request.body
        var user = new User(body)

        if (error) {
            response.status(400).json({message: error.message})
        } else {
            user.profilephoto = request.file.filename;
            user.save().then( data => {
                return response.status(200).json(data)
            }).catch( error => {
            return response.status(400).json(error)
            })
        }
    })
})

router.post('/login' , async (request, response) => {
    //response.send(request.body)
    var body = request.body
    
    var data = await User.findOne({"username":body.username})
    //response.send(data)
    console.log(data)
    if(data){
        //var p = await bcrypt.compare(body.password,data.password)
        if(data.password === body.password){
            console.log(data)
            var obj = {id:data._id,img:data.img}
            var token = await jwt.sign(obj,'sceret',{ expiresIn: 60 })
            console.log(chalk.yellow(token))
            // var t = await jwt.verify(token, 'sceret')
            //return response.writeHead(200,'content-type',await jwt.verify(token, 'sceret'))
            // response.setHeader("ID",t.id)

            let json = {
                name: data.username,
                role: data.role,
                profilephoto: data.profilephoto,
                token: token
            }
            response.status(202).send(json) 
        }else{
            // console.log(data)
            response.status(204).send() 
        }
    }else{  
        response.status(203).send() 
    }
})

router.get('/home', async (request, response,next) => {
    if(request.headers.auth_token){
    await jwt.verify(request.headers.auth_token , 'sceret', (error, data) => {
        if(error){
            // return response.send(error)
            return response.send('Your Session Expired... Please Login Again...')   
        }else{
            request.token_id = data.id;
            request.token_img = data.img;
            return next();
        }
    })
    }else{
        return response.send('please Authenticate...')        
    }
}, (request, response) => {
    // response.json({message:'Welcome',AuthData:request.token_id})
   // response.send(__dirname)
    let imagepath = __dirname + `/uploads/` + request.token_img
    //response.send(imagepath)
    let image = fs.readFileSync(imagepath)
    return response.end(image, 'binary')

});

router.post('/uploads/', (req, res) => {
  
    let id = req.body.id
  
    User.findById(id, (error,data) => {
      if(error){
        return res.send('Invalid Id')
      }
      else{
        if(data){
            let imagepath = __dirname + "/uploads/" + data.img
            let image = fs.readFileSync(imagepath)
            return res.end(image, 'binary')
          }
          return res.send('No Records Found')
      }
    });
})

router.use( (error,request, response, next) => {
    if (error.code == 'ENOENT') {
        response.status(404).json({message: 'Image Not Found !'})
    } else {
        response.status(500).json({message:error.message}) 
    } 
})
module.exports = router
