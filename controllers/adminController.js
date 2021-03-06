const db = require('../models')
const User = db.User
const Reply = db.Reply
const Tweet = db.Tweet
const helpers = require('../_helpers')

const adminController = {
  signInPage: (req, res) => res.render('admin/signin'),
  signIn: (req, res) => {
    req.flash('successMessages', '登入成功')
    res.redirect('/admin/tweets')
  },
  getUsers: (req, res) => {
    return User.findAll({
      include: [
        Tweet,
        { model: Tweet, as: 'LikedTweets' },
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' },
      ]
    })
      .then(result => {
        const data = result.map(item => ({
          ...item.dataValues,
          followingsCount: item.Followings.length,
          followersCount: item.Followers.length,
          likesCount: item.LikedTweets.length,
          tweetsCount: item.Tweets.length,
          isAdmin: item.dataValues.role.includes('admin')
        }))
        const users = data.sort((a, b) => b.tweetsCount - a.tweetsCount)
        res.render('admin/users', { users })
      })
  },
  getTweets: (req, res) => {
    return Tweet.findAll({
      include: [User],
      order: [['createdAt', 'DESC']]
    }).then(tweets => {
      tweets = tweets.map(item => ({
        ...item.dataValues,
        description: item.description.substring(0, 50)
      }))
      res.render('admin/tweets', { tweets })
    })
  },
  deleteTweet: (req, res) => {
    const id = Number(req.params.id)
    if (helpers.getUser(req).role !== 'admin') { return res.redirect('/signin') }
    return Tweet.findAll({ where: { id }, include: [User, Reply] })
      .then(tweet => {
        if (tweet[0].User.dataValues.id !== helpers.getUser(req).id) {
          if (tweet[0].Replies.length) {
            tweet[0].Replies.destroy()
            return tweet[0].destroy()
          }
          return tweet[0].destroy()
        }
      })
      .then(() => res.redirect('/admin/tweets'))
  }
}

module.exports = adminController