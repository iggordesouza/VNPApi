const { v4: uuid } = require('uuid')
const jimp = require('jimp')

const User = require('../models/User')
const Note = require('../models/Note')

const addImage = async buffer => {
  let newName = `${uuid()}.jpg`
  let tmpImg = await jimp.read(buffer)
  tmpImg.cover(500, 500).quality(80).write(`./public/media/${newName}`)
  return newName
}

module.exports = {
  // 5- função para cadastrar as notas
  addAction: async (req, res) => {
    let { numberNote, obs, token } = req.body
    const user = await User.findOne({ token }).exec()

    if (!numberNote) {
      res.json({
        error: 'Numero NF não informado'
      })
      return
    }

    const newNote = new Note()
    newNote.received = false
    newNote.obs = obs
    newNote.idUser = user._id
    newNote.dateCreated = new Date()
    newNote.numberNote = numberNote

    if (req.files && req.files.img) {
      if (req.files.img.length == undefined) {
        if (
          ['image/jpeg', 'image/jpg', 'image/png'].includes(
            req.files.img.mimetype
          )
        ) {
          let url = await addImage(req.files.img.data)
          newNote.images = url
        }
      }
    }

    const info = await newNote.save()
    res.json({ info })
  },
  // 3- Listar todas as notas
  getList: async (req, res) => {
    let { sort = 'asc', offset = 0, q } = req.query
    let filters = null
    let total = 0

    if (q) {
      filters.numberNote = { $regex: q, $options: 'i' }
    }

    const noteTotal = await Note.find(filters).exec()
    total = noteTotal.length

    const noteData = await Note.find(filters)
      .sort({ dateCreated: sort == 'desc' ? -1 : 1 })
      .skip(parseInt(offset))
      .exec()

    let note = []
    for (let i in noteData) {
      let userCreate = await User.findById(noteData[i].idUser).exec()
      note.push({
        id: noteData[i]._id,
        numberNote: noteData[i].numberNote,
        dateCreated: noteData[i].dateCreated,
        userCreate: userCreate.fullName
      })
    }

    res.json({ note, total })
  },
  //1- Listar todas a notas sem aprovação
  getListNotApprov: async (req, res) => {
    let { sort = 'asc', offset = 0, q } = req.query
    let filters = { received: false }
    let total = 0

    if (q) {
      filters.numberNote = { $regex: q, $options: 'i' }
    }

    const noteTotal = await Note.find(filters).exec()
    total = noteTotal.length

    const noteData = await Note.find(filters)
      .sort({ dateCreated: sort == 'desc' ? -1 : 1 })
      .skip(parseInt(offset))
      .exec()

    let noteNotApprov = []
    for (let i in noteData) {
      let userCreate = await User.findById(noteData[i].idUser).exec()
      noteNotApprov.push({
        id: noteData[i]._id,
        numberNote: noteData[i].numberNote,
        dateCreated: noteData[i].dateCreated,
        userCreate: userCreate.fullName
      })
    }

    res.json({ noteNotApprov, total })
  },
  //2- Listar todas a notas do usuário que lançou
  getListUser: async (req, res) => {
    let { sort = 'asc', offset = 0, q } = req.query
    let { token } = req.body
    let filters = {}
    let total = 0

    const user = await User.findOne({ token }).exec()

    if (token) {
      filters.idUser = { $regex: user.id, $options: 'i' }
    }

    if (q) {
      filters.numberNote = { $regex: q, $options: 'i' }
    }

    const noteTotal = await Note.find(filters).exec()
    total = noteTotal.length

    const noteData = await Note.find(filters)
      .sort({ dateCreated: sort == 'desc' ? -1 : 1 })
      .skip(parseInt(offset))
      .exec()

    let noteUser = []
    for (let i in noteData) {
      let userCreate = await User.findById(noteData[i].idUser).exec()
      noteUser.push({
        id: noteData[i]._id,
        numberNote: noteData[i].numberNote,
        received: noteData[i].received,
        dateCreated: noteData[i].dateCreated,
        userCreate: userCreate.fullName
      })
    }

    res.json({ noteUser, total })
  },
  //8- listar uma nota
  getItem: async (req, res) => {
    let { id } = req.query

    if (!id) {
      res.json({ error: 'Sem Nota' })
      return
    }

    if (id.length < 12) {
      res.json({ error: 'ID inválido' })
      return
    }

    const note = await Note.findById(id)
    if (!note) {
      res.json({ error: 'Nota inexistente' })
      return
    }

    let userCreate = await User.findById(note.idUser).exec()
    let userApprov = await User.findById(note.idUserApprov).exec()

    let images = `${process.env.BASE}/media/${note.images}`

    res.json({
      id: note._id,
      numberNote: note.numberNote,
      dateCreated: note.dateCreated,
      images: images,
      userCreate: {
        nameUserCreate: userCreate.fullName,
        userCreate: userCreate.user
      },
      userApprov: {
        nameUserApprov: userApprov.fullName,
        userApprov: userApprov.user
      }
    })
  },
  //6- função para editar nota lançada
  editAction: async (req, res) => {
    let { id } = req.params
    let { numberNote, images, token } = req.body

    if (id.length < 12) {
      res.json({ error: 'ID inválido' })
      return
    }

    const note = await Note.findById(id).exec()
    if (!note) {
      res.json({ error: 'Nota inexistente' })
      return
    }

    const user = await User.findOne({ token }).exec()
    if (user._id.toString() !== note.idUser) {
      res.json({ error: 'Esta nota não é sua' })
      return
    }

    let updates = {}

    if (numberNote) {
      updates.numberNote = numberNote
    }

    if (images) {
      updates.images = images
    }

    await Note.findByIdAndUpdate(id, { $set: updates })

    if (req.files && req.files.img) {
      const noteI = await Note.findById(id)

      if (req.files.img.length == undefined) {
        if (
          ['image/jpeg', 'image/jpg', 'image/png'].includes(
            req.files.img.mimetype
          )
        ) {
          let url = await addImage(req.files.img.data)
          noteI.images.push({ url })
        }
      }

      noteI.images = [...noteI.images]
      await noteI.save()
    }

    res.json({ error: '' })
  },
  //4- função para aprovar as notas
  approvAction: async (req, res) => {
    let { id } = req.params
    let { token } = req.body

    if (id.length < 12) {
      res.json({ error: 'ID inválido' })
      return
    }

    const note = await Note.findById(id).exec()
    if (!note) {
      res.json({ error: 'Nota inexistente' })
      return
    }
    
    if (note.received == true) {
      res.json({ error: 'Nota já aprovada' })
      return
    }

    const user = await User.findOne({ token }).exec()

    if (user.approver == false) {
      res.json({ error: 'Usuário não é aprovador' })
      return
    }

    let updates = {}

    updates.idUserApprov = user._id
    updates.received = true

    await Note.findByIdAndUpdate(id, { $set: updates })

    res.json({ error: '' })
  },
  //7- função para deletar nota não aprovada
  deletAction: async (req, res) => {
    let { id } = req.params

    if (id.length < 12) {
      res.json({ error: 'ID inválido' })
      return
    }

    const note = await Note.findById(id).exec()

    if (note.received == true) {
      return res.json({ error: 'Nota já recebida' })
    }

    await Note.deleteOne({ _id: id })

    res.json({ error: '' })
  }
}
