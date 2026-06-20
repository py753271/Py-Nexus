const orgService = require('../services/organizationService');
const { asyncWrapper } = require('../middlewares/errorHandlers');

// Get organization details
exports.getOrganization = asyncWrapper(async (req, res, next) => {
    const org = await orgService.getOrganizationSpec();
    res.status(200).json({ success: true, data: org });
});

// Update organization details (Admin only)
exports.updateOrganization = asyncWrapper(async (req, res, next) => {
    const { name, description } = req.body;
    if (!name || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Organization name is required' });
    }

    const updated = await orgService.updateOrganizationSpec(name.trim(), description);
    res.status(200).json({ success: true, data: updated });
});
