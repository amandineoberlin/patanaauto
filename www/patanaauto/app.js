'use strict';
const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const limit = '10mb';
const port = 5001;
const static_folder = path.join(__dirname, 'dist/patanaauto');

const app = express();
const server = http.createServer(app);

app.use(cookieParser());
app.use(bodyParser.json({ limit }));
app.use(bodyParser.urlencoded({ extended: true, limit }));

app.use('/', express.static(static_folder));

require('./routes/annonces')(app);
 
server.listen(port, function () {
    console.log('Node Express server for ' + app.name + ' listening on http://localhost:' + port);
});
