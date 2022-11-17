const jwt = require('jsonwebtoken')
const { JWT_KEY } = process.env

const mustLogin = (req, res, next) => {
  try {
    const token = req.headers['authorization']

    if (!token) {
      res.status(401).json({
        status: false,
        message: 'u must login first'
      })
    }

    const decode = jwt.verify(token, JWT_KEY)
    req.user = decode

    next()
  } catch (err) {
    if (err.message == 'jwt malformed') {
      res.status(401).json({
        status: false,
        message: err.message
      })
    }

    next(err)
  }
}

module.exports = mustLogin

