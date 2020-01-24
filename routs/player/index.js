var express = require('express')
var multer = require('multer')
var fs = require('fs')
var path = require('path')
var router = express.Router()

var Player = require('../../schema/Players.js')

// const upload = multer({
//     dest:'uploads/', 
//     // limits: {fileSize: 10000000, files: 1},
//     // fileFilter:  (req, file, callback) => {
    
//     //     if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {

//     //         return callback(new Error('Only Images are allowed !'), false)
//     //     }
//     // },
//     filename: (req,file,cb) => {
//         cb(null, Date.now() + path.extname(file.originalname))
//     }
// }).single('profile')

var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  });
  var upload = multer({ storage : storage}).single('profile');


router.post('/images/upload', (req, res) => {

    upload(req, res, function (err) {
        if (err) {
            res.status(400).json({message: err.message})
        } else {
           //res.send(req.file.originalname)
            let path = `/images/${req.file.filename}`
            res.status(200).json({message: 'Image Uploaded Successfully !', path: path})
        }
    })
})

router.get('/test', (request, response) => {
    response.send('test')
})

router.post('/register',async (request, response) => {

    // player.password = await bcrypt.hash(request.body.password, 8)

    upload(request, response, function (error) {
        let body = request.body
        console.log(body)
        var player = new Player(body)

        if (error) {
            response.status(400).json({message: error.message})
        } else {
            player.profilephoto = request.file.filename;
            player.save().then( data => {
                return response.status(200).json(data)
            }).catch( error => {
            return response.status(400).json(error)
            })
        }
    })

})

router.get('/viewplayers' ,async (request, response) => {
    console.log('request')
    try{
        let data =  await Player.find()
        return response.status(200).send(data)
    }catch(error){  
        return response.status(400).send();
    }
})

router.patch('/edit-player' ,(request, response) => {
    
    upload(request, response, function (error) {
        let body = request.body
        if(request.file){
            body.profilephoto = request.file.filename;
        }
        Player.updateOne({_id:body.id},body,(error , data) => {
            if(error){
                return response.send('Error Occured While Updating')
            }else{
                if(data){
                    response.status(200).send('record Updated..')
                }
            }
        })  
    })
   
})

router.post('/delete-player' , (request, response) => {
    // console.log(request.body)
    Player.deleteOne({_id:request.body.id},(error , data) => {
        if(error){
            return response.send('Error Occured While deleting')
        } else {
                response.status(200).send('record deleted..')
        }
    })
})

router.use((err, req, res, next) => {
    if (err.code == 'ENOENT') {
        res.status(404).json({message: 'Image Not Found !'})
    } else {
        res.status(500).json({message:err.message}) 
    } 
  })
    
module.exports = router
