var MongoClient = require('mongodb').MongoClient;
var args = process.argv;

var helpMessage = '\
Using maintan.js:\n\
maintan.js [collection name] [action]\n\
[collection name] - name of collection you want to list or delete\n\
[action] - can be \'list\' or \'delete\'. \'list\' will show all documents in collection. \'delete\' will drop collection\n\
maintan.js [collection name] - will do the same as maintan.js [collection name] list\n\
';

if (args.length <= 2) {
    help();
} else if (args.length == 3) {
    listDocs(args[2]);
} else if (args[3] == 'list') {
    listDocs(args[2]);
} else if (args[3] == 'delete') {
    deleteCollection(args[2]);
} else {
    help();
}

function help() {
    console.log(helpMessage);
}

function listDocs(collectionName) {
    MongoClient.connect('mongodb://localhost:27017', function(err, db) {
        if (err) throw err;
        db.collection(collectionName).find().toArray(function(err, result) {
            if (err) throw err;
            if (result.length == 0) {
                console.log('No such collection, or collection is empty');
            } else {
                result.forEach(function(item) {
                    console.log(item);
                });
            }
        });
        db.close();
    });
}

function deleteCollection(collectionName) {
    MongoClient.connect('mongodb://localhost:27017', function(err, db) {
        if (err) throw err;
        console.log('Deleting collection ' + collectionName + '.');
        db.collection(collectionName).drop();
        db.close();
        console.log('Collection ' + collectionName + ' deleted.');
    });
}