var express = require('express')
var chalk = require('chalk')
var jwt = require('jsonwebtoken')
var multer = require('multer')
var cors = require('cors')
var router = express.Router()

var User = require('../../schema/User.js')

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({ storage: storage }).single('profile');

router.post('/register', async (request, response) => {
    upload(request, response, function (error) {
        let body = request.body
        var user = new User(body)

        if (error) {
            response.status(400).json({ message: error.message })
        } else {
            user.profilephoto = request.file.filename;
            user.save().then(data => {
                return response.status(200).json(data)
            }).catch(error => {
                return response.status(400).json(error)
            })
        }
    })
})

router.post('/login', async (request, response) => {
    var body = request.body

    var data = await User.findOne({ "username": body.username })
    if (data) {
        if (data.password === body.password) {
            var obj = { id: data._id, img: data.img }
            var token = await jwt.sign(obj, 'sceret', { expiresIn: 60 })
            console.log(chalk.yellow(token))
            let json = {
                name: data.username,
                role: data.role,
                profilephoto: data.profilephoto,
                token: token
            }
            response.status(202).send(json)
        } else {
            response.status(204).send()
        }
    } else {
        response.status(203).send()
    }
})

router.get('/home', async (request, response, next) => {
    if (request.headers.auth_token) {
        await jwt.verify(request.headers.auth_token, 'sceret', (error, data) => {
            if (error) {
                return response.send('Your Session Expired... Please Login Again...')
            } else {
                request.token_id = data.id;
                request.token_img = data.img;
                return next();
            }
        })
    } else {
        return response.send('please Authenticate...')
    }
}, (request, response) => {
    let imagepath = __dirname + `/uploads/` + request.token_img
    let image = fs.readFileSync(imagepath)
    return response.end(image, 'binary')

});

router.post('/uploads/', (req, res) => {

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

router.use((error, request, response, next) => {
    if (error.code == 'ENOENT') {
        response.status(404).json({ message: 'Image Not Found !' })
    } else {
        response.status(500).json({ message: error.message })
    }
})
module.exports = router
