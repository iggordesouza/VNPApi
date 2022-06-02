const { v4: uuid } = require('uuid')
const jimp = require('jimp')
const mongoose = require('mongoose')

const User = require('../models/User')
const Note = require('../models/Note')

const addImage = async buffer => {
  let newName = `${uuid()}.jpg`
  let tmpImg = await jimp.read(buffer)
  tmpImg.cover(500, 500).quality(80).write(`./public/media/${newName}`)
  return newName
}

module.exports = {
  addAction: async (req, res) => {
    let { numberNote, idUserApprov, token } = req.body
    const user = await User.findOne({ token }).exec()

    if (!numberNote || !idUserApprov) {
      res.json({ error: 'Numero NF e/ou Usuário de aprovação não foram preenchidos' })
      return
    }

    if (idUserApprov.length < 12) {
      res.json({ error: 'ID do usuário inválido' })
      return
    }

    const userApprov = await User.findById(idUserApprov)
    if (!userApprov) {
      res.json({ error: 'Usuário de aprovação inexistente' })
      return
    }

    const newAd = new Ad()
    newAd.sent = false
    newAd.idUser = user._id
    newAd.idUserApprov = userApprov.state
    newAd.dateCreated = new Date()
    newAd.numberNote = numberNote

    if (req.files && req.files.img) {
      if (req.files.img.length == undefined) {
        if (
          ['image/jpeg', 'image/jpg', 'image/png'].includes(
            req.files.img.mimetype
          )
        ) {
          let url = await addImage(req.files.img.data)
          newAd.images.push({
            url,
            default: false
          })
        }
      }
    }

    const info = await newAd.save()
    res.json({ id: info._id })
  },
  getList: async (req, res) => {},
  getItem: async (req, res) => {},
  editAction: async (req, res) => {}
}
