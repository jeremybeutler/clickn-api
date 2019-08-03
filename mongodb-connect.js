const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const DATABASE_NAME = "clickn-db";
const uri = "mongodb+srv://" + process.env.MONGO_ATLAS_UN + ":" + process.env.MONGO_ATLAS_PW + "@clickn-db-2zrbr.mongodb.net/test?retryWrites=true&w=majority";

// module.exports.init = async function (callback) {
//     const uri = "mongodb+srv://" + process.env.MONGO_ATLAS_UN + ":" + process.env.MONGO_ATLAS_PW + "@clickn-db-2zrbr.mongodb.net/test?retryWrites=true&w=majority";
//     const client = new MongoClient(uri, { useNewUrlParser: true });
//     await client.connect(err => {
//         this.database = client.db(DATABASE_NAME);
//         client.close();
//         callback(err);
//     });
//     module.exports.database = database
// };


// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://clickn-admin:<password>@clickn-db-2zrbr.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

module.exports.init = (callback) => {
    let database = MongoClient.connect(uri, { useNewUrlParser: true })
    .then(function (response) {
        console.log(response.db(DATABASE_NAME))
        return response.db(DATABASE_NAME)
    })
    .catch(function (err) {
        callback(err)
    })
    console.log(database)
}