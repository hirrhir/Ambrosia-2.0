const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const ctrl = require('../controllers/menu.controller');

router.get('/categories', ctrl.getCategories);
router.post('/categories', authenticate, requireRole('admin'), ctrl.createCategory);

router.get('/items', ctrl.getMenuItems);
router.post('/items', authenticate, requireRole('admin'), ctrl.createMenuItem);
router.patch('/items/:id', authenticate, requireRole('admin'), ctrl.updateMenuItem);
router.delete('/items/:id', authenticate, requireRole('admin'), ctrl.deleteMenuItem);

module.exports = router;
