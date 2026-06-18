const router = require('express').Router();

const PetController = require('../controllers/PetController');

//middlewares
const verifyToken = require('../helpers/verify-token');
const checkAdmin = require('../helpers/check-admin');
const { upload } = require('../helpers/image-upload');

router.post('/create', verifyToken, upload.array('images'), PetController.createPet);
router.get('/pets', PetController.getAll);
router.get('/category', PetController.getAllCategories);
router.get('/mypets', verifyToken, PetController.getAllUserPets);
router.get('/myadoptions', verifyToken, PetController.getAllUserAdoptions);
router.get('/:id', PetController.getPetById);
router.delete('/:id', verifyToken, PetController.removePetById);
router.patch('/:id', verifyToken, upload.array('images'), PetController.updatePet);
router.patch('/schedule/:id', verifyToken, PetController.schedule);
router.patch('/conclude/:id', verifyToken, PetController.concludeAdoption);

router.put('/update-all', verifyToken, checkAdmin, PetController.updateAllisVerified);
module.exports = router;
