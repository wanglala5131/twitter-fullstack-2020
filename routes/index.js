const tweetController = require('../controllers/tweetController')
const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')
const { authenticate } = require('passport')

const authenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'user') { return next() }
  if (req.isAuthenticated() && req.user.role === 'admin') {
    req.flash('errorMessage', '管理員請從後台登入')
    return res.redirect('/signin')
  }
  res.redirect('/signin')
}

const adminAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.role === 'admin') { return next() }
    req.flash('errorMessage', '非管理員請從前台登入')
    return res.redirect('/admin/signin')
  }
  res.redirect('/signin')
}

module.exports = (app, passport) => {
  const multer = require('multer')
  const upload = multer({ dest: 'temp/' })
  const profileUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }])

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  app.get('/signin', userController.signInPage)
  app.post('/signin',
    passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }),
    userController.signIn)

  app.get('/admin/signin', adminController.signInPage)
  app.post('/admin/signin',
    passport.authenticate('local', { failureRedirect: '/admin/signin', failureFlash: true }),
    adminController.signIn)
  app.get('/admin/tweets', adminAuthenticated, adminController.getTweets)
  app.get('/admin/users', adminAuthenticated, adminController.getUsers)

  app.get('/logout', userController.logout)

  app.get('/', userController.getIndexPage)

  app.get('/tweets', authenticated, tweetController.getTweets)
  app.post('/tweets', authenticated, tweetController.postTweet)
  app.post('/tweets/:id/like', authenticated, tweetController.addLike)
  app.delete('/tweets/:id/like', authenticated, tweetController.removeLike)
  app.get('/tweets/:id', authenticated, tweetController.getTweet)
  app.delete('/tweets/:id', adminAuthenticated, adminController.deleteTweet)
  app.post('/tweets/:id/replies', authenticated, tweetController.postReply)

  app.get('/api/users/:id', authenticated, userController.editUser)
  app.post('/api/users/:id', authenticated, profileUpload, userController.putUser)
  app.put('/api/users/:id', authenticated, userController.putUserProfile)

  app.get('/users/:id/tweets', authenticated, userController.getTweets)
  app.get('/users/:id/likes', authenticated, userController.getLikes)
  app.get('/users/:id/replies', authenticated, userController.getReplies)


  app.get('/users/:id/followings', authenticated, userController.getFollowings)
  app.get('/users/:id/followers', authenticated, userController.getFollowers)


  app.post('/followship/:id', authenticated, userController.follow)
  app.delete('/followship/:id', authenticated, userController.unfollow)

}
