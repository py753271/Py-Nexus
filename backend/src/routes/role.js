const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken, requirePermission } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/', requirePermission('users:read'), roleController.getAllRoles);
router.post('/', requirePermission('users:write'), roleController.createRole);
router.put('/:id', requirePermission('users:write'), roleController.updateRole);
router.post('/assign', requirePermission('users:write'), roleController.assignUserRole);
router.get('/permissions', requirePermission('users:read'), roleController.getAllPermissions);

module.exports = router;
