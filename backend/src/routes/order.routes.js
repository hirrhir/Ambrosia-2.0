const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const ctrl = require('../controllers/order.controller');

router.post('/', authenticate, requireRole('customer', 'waiter'), ctrl.createOrder);
router.get('/', authenticate, ctrl.getOrders);
router.patch('/:id/status', authenticate, requireRole('kitchen', 'admin'), ctrl.updateOrderStatus);

module.exports = router;