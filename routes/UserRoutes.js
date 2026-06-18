const router = require('express').Router();
const UserController = require('../controllers/UserController');

const verifyToken = require('../helpers/verify-token');
const { upload } = require('../helpers/image-upload');

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/checkuser', UserController.checkUser);
router.get('/:id', verifyToken, UserController.getUserById);
router.patch('/edit/:id', verifyToken, upload.single('image'), UserController.editUser);
router.delete('/delete', verifyToken, UserController.deleteUser);

module.exports = router;
