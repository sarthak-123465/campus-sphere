const router = require('express').Router();
const authCtrl = require('../controllers/authCtrl');
const auth = require('../middleware/auth');


router.post('/register', authCtrl.register);
router.post("/register_admin", authCtrl.registerAdmin);


router.post("/login", authCtrl.login);
router.post("/admin_login", authCtrl.adminLogin);


router.get('/verify/:token', authCtrl.verify);

router.post('/forgotPassword', authCtrl.forgotPassword);
router.post('/resetPassword/:token', authCtrl.resetPassword);


router.post("/logout", authCtrl.logout);


router.post("/refresh_token", authCtrl.generateAccessToken);


module.exports = router;