const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { verifyToken, requirePermission } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/', requirePermission('depts:read'), departmentController.getAllDepartments);
router.post('/', requirePermission('depts:write'), departmentController.createDepartment);
router.put('/:id', requirePermission('depts:write'), departmentController.updateDepartment);
router.delete('/:id', requirePermission('depts:write'), departmentController.deleteDepartment);

module.exports = router;
