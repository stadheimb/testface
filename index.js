const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const multer = require('multer');
const exec = require('child_process').exec
const fs = require('fs')
const upload = multer({ dest: 'public/' })

function computeAge(file, res) {
    exec(`curl -X POST -F image=@${file} http://169.51.70.103:32487/model/predict`, (err, stdout, stderr) => {
        if(err) {
            console.log("err", err)
            res.send(err)
            res.status(500)
        } else {
            // fs.unlinkSync(file)
            console.log("stdout", stdout)
            res.contentType("application/json")
            res.send(stdout)
            res.status(200);
        }
    })
}

app.use(bodyParser.json());

app.post('/model/predict', upload.any(), (req, res) => {
    var file = req.files[0];
    console.log("FILE", file)
    computeAge(file.path, res)
});

app.post('/file-upload', upload.any(), (req, res) => {
    try {
        fs.unlinkSync("public/last_upload.jpg")
    } catch(err) {}
    fs.renameSync(req.files[0].path, "public/last_upload.jpg")
    res.redirect('/index.html');
})

app.get('/age', (req, res) => {
    var path = "public/last_upload.jpg";
    console.log("Query", path)
    computeAge(path, res)
})

app.use(express.static('public'))

app.listen(process.env.PORT || 4000, () => {
    console.log('Listening on port', (process.env.PORT || 4000))
})