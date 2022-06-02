const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { validationResult, matchedData } = require('express-validator')

const User = require('../models/User')

module.exports = {
  signin: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.json({ error: errors.mapped() })
      return
    }
    const data = matchedData(req)

    //validando o user
    const user = await User.findOne({ user: data.user })
    if (!user) {
      res.json({ error: 'Usuário e/ou senha errados!' })
      return
    }

    //validando a senha
    const match = await bcrypt.compare(data.password, user.passwordHash)
    if (!match) {
      res.json({ error: 'E-mail e/ou senha errados!' })
      return
    }

    const payload = (Date.now() + Math.random()).toString()
    const token = await bcrypt.hash(payload, 10)

    user.token = token
    await user.save()

    res.json({ token, user: data.user })
  },

  signup: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.json({ error: errors.mapped() })
      return
    }
    const data = matchedData(req)

    //verificando se o user existe
    const user = await User.findOne({
      user: data.user
    })
    if (user) {
      res.json({
        error: { user: { msg: 'Usuário já existe' } }
      })
      return
    }

    const passwordHash = await bcrypt.hash(data.password, 10)

    const payload = (Date.now() + Math.random()).toString()
    const token = await bcrypt.hash(payload, 10)

    const newUser = new User({
      fullName: data.fullName,
      user: data.user,
      passwordHash,
      token
    })
    await newUser.save()

    res.json({ token })
  }
}
