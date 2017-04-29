var express = require("express");
var urlExists = require('url-exists');
var MongoClient = require('mongodb').MongoClient;
var app = express();

app.get('/new/*', function(req, res) {
    //extract url from request
    var url = req.url.toString().slice(5);
    console.log(url);
    //check if url is already in database
    MongoClient.connect('mongodb://localhost:27017', function(err, db) {
        if (err) throw err;
        db.collection('urls').find({original_url: url}, {'_id': false}).toArray(function(err, result) {
            if (err) throw err;
            if (result.length != 0) {
                //if exists - return as JSON
                db.close();
                res.end(JSON.stringify(result[0]));
            } else {
                //if not found - create new short url, and return as JSON
                //check if URL is accessible
                urlExists(url, function(err, exists) {
                    if (err) throw err;
                    if (exists) {
                        //create number for use as short URL
                        var short = Math.floor(Math.random() * 10000).toString();
                        //create query
                        var record = {original_url: url, short_url: short};
                        //insert record in database
                        db.collection('urls').insertOne(record, function(err, r) {
                            if (err) throw err;
                        });
                        db.close();
                        //return JSON
                        var record = {original_url: url, short_url: short};
                        res.end(JSON.stringify(record));
                    } else {
                        //if URL not accesible - return JSON with error
                        var record = {error:"Wrong url format, make sure you have a valid protocol and real site."};
                        db.close();
                        res.end(JSON.stringify(record));
                    }
                });
            }
            
        });
        db.collection('urls').find().toArray(function (err, result) {
            if (err) throw err;
            result.forEach(function (item) {
                console.log(item);
            });
        });
    });
});

app.get('/*', function (req, res) {
    //extract url from request
    var url = req.url.toString().slice(1);
    //check if short URL in database
    MongoClient.connect('mongodb://localhost:27017', function(err, db) {
        if (err) throw err;
        db.collection('urls').find({short_url: url}).toArray(function(err, result) {
            if (err) throw err;
            if (result.length!=0) {
                db.close();
                res.redirect(result[0]['original_url'].toString());
            } else {
                db.close();
                res.end('no such short url')
            }
        });
    });
});

/*app.get('/favicon.ico', function(res, req) {
    console.log('fav');
});*/

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});

