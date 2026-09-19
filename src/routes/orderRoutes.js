const express = require('express');
const router = express.Router();
const { getAll, create, updateStatus, uploadReceipt, getMetrics } = require('../controllers/orderController');
const auth = require('../middlewares/auth');
const isAdmin = require('../middlewares/isAdmin');
const upload = require('../middlewares/upload');

router.get('/metrics', auth, isAdmin, getMetrics);
router.get('/', auth, isAdmin, getAll);
router.post('/', upload.single('receipt'), create); // Público con archivo opcional
router.patch('/:id/receipt', upload.single('receipt'), uploadReceipt); // Público - subir comprobante después
router.patch('/:id/status', auth, isAdmin, updateStatus);

module.exports = router;
