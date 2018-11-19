const express = require("express");
const app = express();
const db = require("./db.js");
const bodyParser = require("body-parser");
const s3 = require("./s3.js");
const { s3Url } = require("./config.json");

var multer = require("multer");
var uidSafe = require("uid-safe");
var path = require("path");

var diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.use(bodyParser.json());
console.log("server.js");
app.use(express.static("./public"));

// app.get("/", (req, res) => {
//     res.sendFile("/index.html");
// });

app.get("/image", (req, res) => {
    return db
        .getImages()
        .then(result => {
            res.json(result);
        })
        .catch(function(err) {
            console.log("ERROR IN GET /IMAGES :", err.message);
        });
});

app.get("/image/more/:id", (req, res) => {
    return db.getMoreImages(req.params.id).then(result => {
        console.log(result);
        res.json(result);
    });
});

app.get("/modal/:id", (req, res) => {
    console.log("REQ.PARAMS: ", req.params);
    console.log("REQ.PARAMS.ID: ", req.params.id);
    return db
        .getBigImage(req.params.id)
        .then(result => {
            console.log("getBigImage Result :", result);
            return db.showComments(req.params.id).then(data => {
                console.log("DATA of COMMENTS :", data);
                res.json({ result, data });
            });
        })
        .catch(function(err) {
            console.log("ERROR IN GET /MODAL :", err.message);
            res.json({});
        });
});

app.post("/comment/:id", (req, res) => {
    return db
        .uploadComment(req.params.id, req.body.username, req.body.comment)
        .then(result => {
            console.log("uploadComment Result :", result);
            res.json(result);
        })
        .catch(function(err) {
            console.log("ERROR IN POST /COMMENT :", err.message);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, function(req, res) {
    const imgUrl = s3Url + req.file.filename;
    console.log(imgUrl);
    // If nothing went wrong the file is already in the uploads directory
    if (req.file) {
        console.log("REQ.FILE :", req.file);
        return db
            .uploadData(
                req.body.username,
                req.body.desc,
                imgUrl,
                req.body.title
            )
            .then(result => {
                console.log("RESULTTTT:", result);
                res.json(result);
            })
            .catch(err => {
                console.log("CATCH ERROR IN POST UPLOAD", err.message);
            });
    }
});

app.post("/delete/:id", (req, res) => {
    console.log("req params id", req.params);
    db.deleteComments(req.params.id)
        .then(result => {
            console.log("deleteImages result", result);
            db.deleteImage(req.params.id);
        })
        .catch(err => {
            console.log("error in 1 delete", err.message);
        })
        .then(data => {
            console.log("deleteComments data", data);
            res.redirect("/");
        })
        .catch(err => {
            console.log("error in post delete", err.message);
        });
});

app.listen(8080, () => console.log(`I'm listening!`));
