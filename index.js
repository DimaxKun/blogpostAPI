const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts')

const app = express();
// When hosted behind a proxy (Render), this makes req.protocol match the public scheme.
app.set('trust proxy', true);

app.use(cors());

mongoose.connect('mongodb+srv://admin:admin1234@alicluster.rzokgxg.mongodb.net/b598-s87-s89?appName=AliCluster')

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => console.log("We're connected to the cloud database"));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/users', userRoutes);
app.use('/posts', postRoutes)

// Serve uploaded images so the rich-text editor can reference them.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if(require.main === module){
	app.listen(process.env.PORT || 4000, () => {
	    console.log(`API is now online on port ${ process.env.PORT || 4000 }`)
	});
}

module.exports = {app, mongoose};