const express = require('express')
const router = express.Router()

const Auth = require('./middlewares/Auth')

const AuthValidator = require('./validators/AuthValidator')
const UserValidator = require('./validators/UserValidator')

const AuthController = require('./controllers/AuthController')
const UserController = require('./controllers/UserController')
const AddNfController = require('./controllers/AddNfController')

router.get('/ping', (req, res) => {
  res.json({ pong: true })
})


router.post('/user/signin', AuthValidator.signin, AuthController.signin)
router.post('/user/signup', AuthValidator.signup, AuthController.signup)

/*router.put(
  '/user/me',
  UserValidator.editAction,
  Auth.private,
  UserController.editAction
)*/

//router.post('/note/add', Auth.private, AddNfController.addAction)
//router.get('/note/list', AddNfController.getList)
//router.get('/note/item', AddNfController.getItem)
//router.post('/note/:id', Auth.private, AddNfController.editAction)

module.exports = router
