var express = require('express')
var multer = require('multer')
var path = require('path')
var router = express.Router()

var Player = require('../../schema/Players.js')

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
        console.log(body)
        var player = new Player(body)

        if (error) {
            response.status(400).json({ message: error.message })
        } else {
            player.profilephoto = request.file.filename;
            player.save().then(data => {
                return response.status(200).json(data)
            }).catch(error => {
                return response.status(400).json(error)
            })
        }
    })

})

router.get('/viewplayers', async (request, response) => {
    try {
        let data = await Player.find()
        return response.status(200).send(data)
    } catch (error) {
        return response.status(400).send();
    }
})

router.patch('/edit-player', (request, response) => {

    upload(request, response, function (error) {
        let body = request.body
        if (request.file) {
            body.profilephoto = request.file.filename;
        }
        Player.updateOne({ _id: body.id }, body, (error, data) => {
            if (error) {
                return response.send('Error Occured While Updating')
            } else {
                if (data) {
                    response.status(200).send('record Updated..')
                }
            }
        })
    })

})

router.post('/delete-player', (request, response) => {
    Player.deleteOne({ _id: request.body.id }, (error, data) => {
        if (error) {
            return response.send('Error Occured While deleting')
        } else {
            response.status(200).send('record deleted..')
        }
    })
})

router.use((err, req, res, next) => {
    if (err.code == 'ENOENT') {
        res.status(404).json({ message: 'Image Not Found !' })
    } else {
        res.status(500).json({ message: err.message })
    }
})

module.exports = router
