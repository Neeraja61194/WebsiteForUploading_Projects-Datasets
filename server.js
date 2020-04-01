const express = require('express');
const app = express();
const port = 3000;
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017';
const path = require('path')
const nodemailer = require('nodemailer');
require('dotenv').config();

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

//This is what you use to have multipart form data
const multer = require('multer');
// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/users')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage });
app.use('/', express.static('public'));

//Setting up pug as template engine
//using the convention to have all views in views folder.
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('Main_Page');
});

app.get('/contact', (req, res) => {        
    res.render('contact');
});

app.get('/Learn', (req, res) => {        
    res.render('Learn');
});
/*
app.get('/Datasets', (req, res) => {        
    res.render('Datasets');
});
*/
app.get('/Datasets', (req, res) => {
    //internal scope of this function
    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('datasets');

        collection.find({}).toArray((error, documents) => {
            client.close();
            documents.reverse();
            const datasetsVariables = {
                pageTitle: "First page of our app",
                datasets: documents
            }
            res.render('Datasets', { datasetsVariables: datasetsVariables });
        });
    });
});

//Create Upload_dataset
app.get('/Upload_dataset', (req, res) => {
    //internal scope of this function
    res.render('Upload_dataset');
})

//detail view
app.get('/datasets/:id', (req, res) => {
    //internal scope of this function
    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('datasets');
        const selectedId = req.params.id;

        collection.find({ "_id": ObjectID(selectedId) }).toArray((error, documents) => {
            client.close();
            res.render('dataset', { dataset: documents[0] });
        });
    });
}); 

//delete endpoint
app.get('/delete_dataset/:id', (req, res) => {
    //internal scope of this function
    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('datasets');
        const idToDelete_dataset = req.params.id;

        collection.deleteOne({ "_id": ObjectID(idToDelete_dataset) });
        client.close();
        res.redirect('/Datasets');
    });
});

app.get('/download/:id',(req,res)=>{
    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('datasets');
        const idToDownload_dataset = req.params.id;
        
        var myDocument = collection.find({ "_id": ObjectID(idToDownload_dataset) }).toArray((error, documents) => {
            const download_file = __dirname+'/public/img/users/'+ documents[0].dataset;
            res.download(download_file)
            client.close(); 
        });
    });
});

app.get('/downloadproject/:id',(req,res)=>{
    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('projects');
        const idToDownload_dataset = req.params.id;
        
        var myDocument = collection.find({ "_id": ObjectID(idToDownload_dataset) }).toArray((error, documents) => {
            const download_file = __dirname+'/public/img/users/'+ documents[0].project;
            res.download(download_file)
            client.close(); 
        });
    });
});

//Create post method
app.post('/datasets', upload.single('file'), (req, res) => {
    //internal scope of this function
    const newDataset = {
        name: req.body.name,
        type: req.body.type,
        desc: req.body.description,
        authName: req.body.authorName,
        uplDate: req.body.date,
        dataset: req.file.filename
    }
    //Replace .push() to a mongodb call
    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('datasets');

        collection.insertOne(newDataset);
        
        let mailOptions = {
            from: 'neerajajithinp@gmail.com',
            to: 'neerajan.mec@gmail.com',
            subject: 'Email Notification from AI Website - New Dataset',
            text: `A new Dataset is added to the collection by ${req.body.authorName}. The details are :
            1. Name : ${req.body.name}
            2. Type : ${req.body.type}
            3. Description ; ${req.body.description}`
        };

        transporter.sendMail(mailOptions, function(err, data){
            if(err) {
                console.log('Error Occurs !!!!!')
            } else {
                console.log('Email notification Sent to the Admin after a Dataset is Added!!');
            }
        });

        client.close();
        res.redirect('/Datasets');
    });
});
/*
app.get('/Projects', (req, res) => {        
    res.render('Projects');
}); */

app.get('/Users', (req, res) => {
    //internal scope of this function
    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('users');

        collection.find({}).toArray((error, documents) => {
            client.close();
            documents.reverse();
            const indexVariables = {
                pageTitle: "First page of our app",
                users: documents
            }
            res.render('Users', { variables: indexVariables});
        });
    });
});

app.get('/create', (req, res) => {
    //internal scope of this function
    res.render('create');
})

//detail view
app.get('/users/:id', (req, res) => {
    //internal scope of this function
    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('users');
        const selectedId = req.params.id;

        collection.find({ "_id": ObjectID(selectedId) }).toArray((error, documents) => {
			db.collection('projects').find({"userName":documents[0].name}).toArray(function(err, projectList) {
				client.close();
				res.render('user', { user: documents[0] ,projectList:projectList });
			});			
        });
    });
});

//update view
app.get('/update/:id', (req, res) => {
    //internal scope of this function
    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('users');
        const selectedId = req.params.id;

        collection.find({ "_id": ObjectID(selectedId) }).toArray((error, documents) => {
            client.close();
            res.render('update', { user : documents[0] });
        });
    });
});

//delete endpoint
app.get('/delete/:id', (req, res) => {
    //internal scope of this function
    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('users');
        const idToDelete = req.params.id;

        collection.deleteOne({ "_id": ObjectID(idToDelete) });
        client.close();
        res.redirect('/Users');
    });
});

app.get('/Projects', (req, res) => {
    //internal scope of this function
    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('projects');

        collection.find({}).toArray((error, documents) => {
            client.close();
            documents.reverse();
            const projectsVariables = {
                pageTitle: "First page of our app",
                projects: documents
            }
            res.render('Projects', { projectsVariables: projectsVariables });
        });
    });
});

//Create Upload_dataset
app.get('/Upload_Project', (req, res) => {
    //internal scope of this function
	    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('users');
		var userNameList = []
        collection.find({}).toArray((error, documents) => {
            client.close();
			documents.forEach(document => { 
				userNameList.push(document.name);
			}); 
            res.render('Upload_Project', { userNameList: userNameList});
        });
    });
    //res.render('Upload_Project');
});

//delete endpoint
app.get('/delete_project/:id', (req, res) => {
    //internal scope of this function
    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('projects');
        const idToDelete_project = req.params.id;

        collection.deleteOne({ "_id": ObjectID(idToDelete_project) });
        client.close();
        res.redirect('/Projects');
    });
});

app.get('/download_project/:id',(req,res)=>{
    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('projects');
        const idToDownload_project = req.params.id;
        
        var myDocument = collection.find({ "_id": ObjectID(idToDownload_project) }).toArray((error, documents) => {
            const download_proj = __dirname+'/public/img/users/'+ documents[0].project;
            res.download(download_proj)
            client.close(); 
        });
    });
});

app.post('/user', upload.single('file'), (req, res) => {
    //internal scope of this function
    const newProject = {
        name: req.body.name,
        type: req.body.type,
        descr: req.body.description,
        lang: req.body.language,
        userName:req.body.userName,
        date: req.body.date,
        project: req.file.filename
    }
    
    //Replace .push() to a mongodb call
    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('projects');

        collection.insertOne(newProject);

        client.close();
        res.redirect('/Projects');
    });
});

//Create post method
app.post('/users', upload.single('file'), (req, res) => {
    //internal scope of this function
    const newUser = {
        name: req.body.user.toUpperCase(),
        email: req.body.userEmail,
        descr: req.body.description,
        desig: req.body.designation,
        linkedin: req.body.linkedIn,
        image: req.file.filename
    }
    
    //Replace .push() to a mongodb call
    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('users');

        collection.insertOne(newUser);

        let mailOptions_user = {
            from: 'neerajajithinp@gmail.com',
            to: 'neerajan.mec@gmail.com',
            subject: 'Email Notification from AI Website - New User',
            text: `A New User created an account in the AI Website. 
            The details are :
            1. Name : ${req.body.user}
            2. Email : ${req.body.userEmail}
            3. Designation/ Job Title : ${req.body.designation}
            4. Description ; ${req.body.description}`
        };

        transporter.sendMail(mailOptions_user, function(err, data){
            if(err) {
                console.log('Error Occurs !!!!!')
            } else {
                console.log('Email notification Sent to the Admin after a New User Account is created!!');
            }
        });

        client.close();
        res.redirect('/Users');
    });
});

//Update method userUpdate
app.post('/userUpdate/:id', upload.single('file'), (req, res) => {

    MongoClient.connect(url, function (err, client) {
        const db = client.db('AI_Datasets');
        const collection = db.collection('users');
        const selectedId = req.params.id;

        let filter = { "_id": ObjectID(selectedId) };

        let updateObject = {
            "name": req.body.user.toUpperCase(),
        }

        if (req.file){
            
            updateObject.image = req.file.filename;
        }
        
        let update = {
            $set: updateObject
        };

        collection.updateOne(filter, update);

        client.close();
        res.redirect('/Users');
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});