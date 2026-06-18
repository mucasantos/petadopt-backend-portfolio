const router = require('express').Router()

const PetController = require('../controllers/PetController')
const UserController = require('../controllers/UserController')
const AdminController = require('../controllers/AdminController')


//middlewares
const verifyToken = require('../helpers/verify-token')
const checkAdmin = require('../helpers/check-admin')


router.get('/pets', verifyToken, checkAdmin, AdminController.getAllPets)
router.get('/users', verifyToken, checkAdmin, AdminController.getAllUsers)
router.get('/adoptions', verifyToken, checkAdmin, PetController.getAllUserAdoptions)
router.get('/:id', PetController.getPetById)
router.delete('/:id', verifyToken, checkAdmin, AdminController.removePetById)
router.patch('/verify/:id', verifyToken, checkAdmin, UserController.editUser)



module.exports = router


