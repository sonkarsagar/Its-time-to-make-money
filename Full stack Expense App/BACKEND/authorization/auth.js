const jwt = require("jsonwebtoken");
const user = require("../models/user");

const authorize = (req, res, next) => {
  const token = req.header("Authorization");
  const userId=jwt.verify(token, 'chaabi')
  user.findByPk(userId.userId).then((result) => {
    req.user=result
    next()
  }).catch((err) => {
    console.log(err);
  });
}

module.exports = { authorize };
