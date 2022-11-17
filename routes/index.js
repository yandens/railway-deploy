const router = require("express").Router();
const user = require("../controllers/user");
const middleware = require("../middleware/mustLogin");
const { User } = require('../models')

router.get('/', (req, res) => {
  return res.status(200).json({
    status: true,
    message: 'success'
  })
})
router.get('/user', async (req, res, next) => {
  try {
    const user = await User.findAll()

    return res.status(200).json({
      status: true,
      message: 'success',
      data: user
    })
  } catch (err) {
    next(err)
  }
})
router.post("/login", user.login);
router.get('/forgot-password-page', user.forgotPasswordPage)
router.post("/forgot-password", user.forgotPassword);
router.post("/reset-password", user.resetPassword);
router.get('/reset-password-page', user.resetPasswordPage)

module.exports = router;
