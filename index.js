const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const multer = require('multer');
const exec = require('child_process').exec
const fs = require('fs')
const upload = multer({ dest: 'public/' })

function faceModelCmd(file) {
    return `curl -X POST -F image=@${file} http://169.51.70.103:32487/model/predict`;
}
function computeAge(file, res) {
    exec(faceModelCmd(file), (err, stdout, stderr) => {
        if(err) {
            console.log("ERROR", err)
            res.send(err)
            res.status(500)
        } else {
            // fs.unlinkSync(file)
            console.log("OK", stdout)
            res.contentType("application/json")
            res.send(stdout)
            res.status(200);
        }
    })
}

function testConnection() {
    console.log('Tester forbindelse med face model ....')
    exec(faceModelCmd('public/test_image.jpg'), (err, stdout, stderr) => {
        if(err) {
            console.log("ERROR", err)
        } else {
            console.log("OK", stdout)
        }
    })
}

app.use(bodyParser.json());

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

app.get('/bilder', (req, res) => {
    files = fs.readdirSync('public').filter(item => {
        return item.endsWith('.jpg') && item != "last_upload.jpg"
    })
    res.send(files.map(item => {
        return `<li><a href='bruk?bilde=${item}'>${item}</a></li>`
    }))
})

app.get('/bruk', (req, res) => {
    console.log(req.query)
    fs.copyFileSync(`public/${req.query.bilde}`, 'public/last_upload.jpg')
    res.redirect('/index.html');
})

app.use(express.static('public'))

app.listen(process.env.PORT || 4000, () => {
    console.log('Listening on port', (process.env.PORT || 4000))
    testConnection()
})