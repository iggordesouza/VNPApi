const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const modelSchema = new mongoose.Schema({
  fullName: String,
  user: String,
  passwordHash: String
})

const modelName = 'User'

if (mongoose.Connection && mongoose.connection.models[modelName]) {
  module.exports = mongoose.connection.models[modelName]
} else {
  module.exports = mongoose.model(modelName, modelSchema)
}
