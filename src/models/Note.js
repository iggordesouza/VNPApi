const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const modelSchema = new mongoose.Schema({
  idUser: String,
  idUserApprov: String,
  numberNote: String,
  images: String,
  dateCreated: Date,
  sent: Boolean,
  received: Boolean,
  dateReceived: String
})

const modelName = 'Note'

if (mongoose.Connection && mongoose.connection.models[modelName]) {
  module.exports = mongoose.connection.models[modelName]
} else {
  module.exports = mongoose.model(modelName, modelSchema)
}
