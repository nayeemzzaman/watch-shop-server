const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectID;
const cors = require('cors');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yuvpr.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
const port = 4000;

app.get('/', (req, res) => {
    res.send("Server stared!");
})
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const watchCollection = client.db("watchshopdb").collection("watches");
    const adminCollection = client.db("watchshopdb").collection("admin");

    app.get('/watches', (req, res) => {
        watchCollection.find({})
            .toArray((err, docs) => {
                res.send(docs);
            })
    })
    app.post('/addWatch', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const price = req.body.price;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimeType,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }
        watchCollection.insertOne({ name, price , image, })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, watch) => {
                res.send(watch.length > 0);
            })
    })
});
app.listen(process.env.PORT || port);