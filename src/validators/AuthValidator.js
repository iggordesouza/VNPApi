const { checkSchema } = require('express-validator')

module.exports = {
  signup: checkSchema({
    fullName: {
      trim: true,
      isLength: {
        options: { min: 2 }
      },
      errorMessage: 'Nome precisa ter duas letras'
    },
    user: {
      trim: true,
      isLength: {
        options: { min: 2 }
      },
      errorMessage: 'User invalidor'
    },
    password: {
      isLength: {
        options: { min: 2 }
      },
      errorMessage: 'Senha precisa ter pelo menos dois caracteres'
    }
  }),
  signin: checkSchema({
    user: {
      isLength: {
        options: { min: 2 }
      },
      errorMessage: 'E-mail invalidor'
    },
    password: {
      isLength: {
        options: { min: 2 }
      },
      errorMessage: 'Senha precisa ter pelo menos dois caracteres'
    }
  })
}
