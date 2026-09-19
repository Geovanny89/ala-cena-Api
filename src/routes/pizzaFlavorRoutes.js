const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/pizzaFlavorController');
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');

router.get('/', getAll);
router.post('/', auth, isAdmin, create);
router.put('/:id', auth, isAdmin, update);
router.delete('/:id', auth, isAdmin, remove);

module.exports = router;
