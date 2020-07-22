const userController = require('../controllers/userController')
const tweetController = require('../controllers/tweetController')

const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/signin')
}

module.exports = (app, passport) => {
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  app.get('/signin', userController.signInPage)
  app.post('/signin',
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/signin', failureFlash: true }),
    userController.signIn)

  app.get('/admin/signin', (req, res) => res.render('admin/signin'))
  app.get('/admin/tweets', (req, res) => res.render('admin/tweets'))
  app.get('/admin/users', (req, res) => res.render('admin/users'))

  app.get('/', (req, res) => res.redirect('/tweets'))
  app.get('/tweets', authenticated, tweetController.getTweets)

  app.get('/api/users/:id', (req, res) => res.render('setting'))

  //和個人資料相關
  app.get('/users/:id/tweets', authenticated, userController.getTweets)
  app.get('/users/:id/likes', authenticated, userController.getLikes)
  app.get('/users/:id/replies', authenticated, userController.getReplies)
}
