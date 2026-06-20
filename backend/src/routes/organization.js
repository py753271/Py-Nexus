const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { verifyToken, requirePermission } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/', requirePermission('orgs:read'), organizationController.getOrganization);
router.put('/', requirePermission('orgs:write'), organizationController.updateOrganization);

module.exports = router;
