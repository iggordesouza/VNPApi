const { v4: uuid } = require('uuid')
const jimp = require('jimp')
const mongoose = require('mongoose')

const User = require('../models/User')

module.exports = {
  getList: async (req, res) => {
    const userTotal = await User.find()
    let users = []
    for (let i in userTotal) {
      users.push({
        id: userTotal[i]._id,
        fullName: userTotal[i].fullName,
        user: userTotal[i].user
      })
    }

    res.json({ users })
  }
}
