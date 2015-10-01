//Dependencies
var express = require('express');
var bodyParser = require('body-parser');

//Express
var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//Roures
app.use('/api', require('./routes/api'));

// Start server
app.listen(3000);
console.log('API is running on port 3000');
