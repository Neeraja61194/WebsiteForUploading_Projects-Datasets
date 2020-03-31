const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

MongoClient.connect(url, function (err, client) {
    console.log("Connected successfully to server");

    const db = client.db('comics'); //use comics
    const collection = db.collection('superheroes'); //db.superheroes

    collection.find({}).toArray((error, documents) => {
        console.log(documents);

    const db = client.db('AI_Datasets'); //use comics
    const collection = db.collection('datasets'); //db.superheroes

    collection.find({}).toArray((error, documents_data) => {
        console.log(documents_data);
    })
});