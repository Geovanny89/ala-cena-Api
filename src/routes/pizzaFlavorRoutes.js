const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/pizzaFlavorController');
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const uploadPizza = require('../middlewares/uploadPizza');

router.get('/', getAll);
router.post('/', auth, isAdmin, uploadPizza.single('image'), create);
router.put('/:id', auth, isAdmin, uploadPizza.single('image'), update);
router.delete('/:id', auth, isAdmin, remove);

module.exports = router;
