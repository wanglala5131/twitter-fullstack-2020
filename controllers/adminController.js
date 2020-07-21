const db = require('../models')
const User = db.User
const Reply = db.Reply
const Tweet = db.Tweet
const Like = db.Like

const adminController = {
  getUsers: (req, res) => {
    return User.findAll({
      include: [
        Tweet,
        { model: User, as: 'Followings' },
        { model: User, as: 'Followers' },
        { model: Reply, include: Tweet },
        { model: Like, include: Tweet }
      ]
    })
      .then(result => {
        const data = result.map(item => ({
          ...item.dataValues,
          followingsCount: item.Followings.length,
          followersCount: item.Followers.length,
          likesCount: item.Likes.length,
          repliesCount: item.Replies.length
        }))
        const users = data.sort((a, b) => b.Tweets.length - a.Tweets.length)

        res.render('admin/users', { users })
      })
  }
}

module.exports = adminController