const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const DATABASE_NAME = "clickn-db";
// const uri = "mongodb+srv://" + process.env.MONGO_ATLAS_UN + ":" + process.env.MONGO_ATLAS_PW + "@clickn-db-2zrbr.mongodb.net/test?retryWrites=true&w=majority";
const uri = "mongodb+srv://" + process.env.MONGO_ATLAS_UN + ":" + process.env.MONGO_ATLAS_PW + "@clickn-db-2zrbr.mongodb.net/test?retryWrites=true&w=majority";
module.exports.db = null

module.exports.init = async () => {
    let client = await MongoClient.connect(uri, { useNewUrlParser: true })
    let db = client.db('clickn-db')
    // console.log(db)
    module.exports.db = db
}