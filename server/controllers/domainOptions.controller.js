const asyncHandler = require('express-async-handler');
const DomainOption = require('../models/DomainOption');

// GET /api/admin/domain-options
const getDomainOptions = asyncHandler(async (req, res) => {
    const domains = await DomainOption.find().sort({ name: 1 });
    res.json({ success: true, data: domains });
});

// POST /api/admin/domain-options
const createDomainOption = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        res.status(400);
        throw new Error('Domain name is required.');
    }
    const exists = await DomainOption.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (exists) {
        res.status(400);
        throw new Error('Domain already exists.');
    }
    const domain = await DomainOption.create({ name: name.trim() });
    res.status(201).json({ success: true, data: domain });
});

// PUT /api/admin/domain-options/:id
const updateDomainOption = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const domain = await DomainOption.findById(req.params.id);
    if (!domain) {
        res.status(404);
        throw new Error('Domain not found.');
    }
    if (name && name.trim()) {
        const duplicate = await DomainOption.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }, _id: { $ne: domain._id } });
        if (duplicate) {
            res.status(400);
            throw new Error('Domain name already exists.');
        }
        domain.name = name.trim();
    }
    await domain.save();
    res.json({ success: true, data: domain });
});

// DELETE /api/admin/domain-options/:id
const deleteDomainOption = asyncHandler(async (req, res) => {
    const domain = await DomainOption.findById(req.params.id);
    if (!domain) {
        res.status(404);
        throw new Error('Domain not found.');
    }
    await domain.deleteOne();
    res.json({ success: true, message: 'Domain deleted.' });
});

// POST /api/admin/domain-options/seed
const seedDomainOptions = asyncHandler(async (req, res) => {
    const defaults = ['MERN', 'JAVA', 'PYTHON', 'DA', 'QA', 'DSA', 'Other'];
    let created = 0;
    for (const name of defaults) {
        const exists = await DomainOption.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (!exists) {
            await DomainOption.create({ name });
            created++;
        }
    }
    res.json({ success: true, data: { created, existed: defaults.length - created } });
});

module.exports = { getDomainOptions, createDomainOption, updateDomainOption, deleteDomainOption, seedDomainOptions };
