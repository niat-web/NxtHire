const asyncHandler = require('express-async-handler');
const AppSetting = require('../models/AppSetting');

const VALID_CATEGORIES = ['sourcing_channels', 'proficiency_levels', 'payment_tiers', 'tech_stacks', 'interview_statuses'];

// GET /api/admin/app-settings/:category
const getSettings = asyncHandler(async (req, res) => {
    const { category } = req.params;
    if (!VALID_CATEGORIES.includes(category)) { res.status(400); throw new Error('Invalid category.'); }
    const items = await AppSetting.find({ category }).sort({ sortOrder: 1, value: 1 });
    res.json({ success: true, data: items });
});

// GET /api/admin/app-settings — all categories at once
const getAllSettings = asyncHandler(async (req, res) => {
    const items = await AppSetting.find().sort({ category: 1, sortOrder: 1, value: 1 });
    const grouped = {};
    VALID_CATEGORIES.forEach(c => { grouped[c] = []; });
    items.forEach(item => { if (grouped[item.category]) grouped[item.category].push(item); });
    res.json({ success: true, data: grouped });
});

// POST /api/admin/app-settings/:category
const createSetting = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { value, label, amount } = req.body;
    if (!VALID_CATEGORIES.includes(category)) { res.status(400); throw new Error('Invalid category.'); }
    if (!value || !label) { res.status(400); throw new Error('Value and label are required.'); }
    const exists = await AppSetting.findOne({ category, value: { $regex: new RegExp(`^${value.trim()}$`, 'i') } });
    if (exists) { res.status(400); throw new Error('Item already exists.'); }
    const maxOrder = await AppSetting.findOne({ category }).sort({ sortOrder: -1 });
    const item = await AppSetting.create({ category, value: value.trim(), label: label.trim(), amount, sortOrder: (maxOrder?.sortOrder || 0) + 1 });
    res.status(201).json({ success: true, data: item });
});

// PUT /api/admin/app-settings/:id
const updateSetting = asyncHandler(async (req, res) => {
    const item = await AppSetting.findById(req.params.id);
    if (!item) { res.status(404); throw new Error('Not found.'); }
    const { value, label, amount } = req.body;
    if (value) {
        const dup = await AppSetting.findOne({ category: item.category, value: { $regex: new RegExp(`^${value.trim()}$`, 'i') }, _id: { $ne: item._id } });
        if (dup) { res.status(400); throw new Error('Value already exists.'); }
        item.value = value.trim();
    }
    if (label) item.label = label.trim();
    if (amount !== undefined) item.amount = amount;
    await item.save();
    res.json({ success: true, data: item });
});

// DELETE /api/admin/app-settings/:id
const deleteSetting = asyncHandler(async (req, res) => {
    const item = await AppSetting.findById(req.params.id);
    if (!item) { res.status(404); throw new Error('Not found.'); }
    await item.deleteOne();
    res.json({ success: true, message: 'Deleted.' });
});

// POST /api/admin/app-settings/seed-all — seed all defaults
const seedAllDefaults = asyncHandler(async (req, res) => {
    const defaults = {
        sourcing_channels: [
            { value: 'LinkedIn', label: 'LinkedIn' },
            { value: 'Referral', label: 'Referral' },
            { value: 'Job Portal', label: 'Job Portal' },
            { value: 'Website', label: 'Website' },
            { value: 'Other', label: 'Other' },
        ],
        proficiency_levels: [
            { value: 'Beginner', label: 'Beginner' },
            { value: 'Intermediate', label: 'Intermediate' },
            { value: 'Advanced', label: 'Advanced' },
            { value: 'Expert', label: 'Expert' },
        ],
        payment_tiers: [
            { value: 'Tier 1', label: 'Tier 1', amount: 500 },
            { value: 'Tier 2', label: 'Tier 2', amount: 750 },
            { value: 'Tier 3', label: 'Tier 3', amount: 1000 },
        ],
        tech_stacks: [
            { value: 'MERN', label: 'MERN' },
            { value: 'Python', label: 'Python' },
            { value: 'React', label: 'React' },
            { value: 'Domain Expert', label: 'Domain Expert' },
            { value: 'Python+SQL', label: 'Python+SQL' },
            { value: 'MERN+Node', label: 'MERN+Node' },
            { value: 'Java + SQL', label: 'Java + SQL' },
            { value: 'JavaScript & C++', label: 'JavaScript & C++' },
            { value: 'May Edition', label: 'May Edition' },
            { value: 'ATCD MERN TR-1', label: 'ATCD MERN TR-1' },
            { value: 'MERN+NextJS', label: 'MERN+NextJS' },
            { value: 'ATCD DSA TR-1', label: 'ATCD DSA TR-1' },
            { value: 'ATCD - React Project', label: 'ATCD - React Project' },
            { value: 'College Plus', label: 'College Plus' },
            { value: 'TCD DSA TR-1', label: 'TCD DSA TR-1' },
            { value: 'TCD MERN TR-1', label: 'TCD MERN TR-1' },
            { value: 'June Edition', label: 'June Edition' },
            { value: 'Java+Spring', label: 'Java+Spring' },
            { value: 'NIAT - React', label: 'NIAT - React' },
            { value: 'TCD - React Project', label: 'TCD - React Project' },
        ],
        interview_statuses: [
            { value: 'Pending Student Booking', label: 'Pending Student Booking' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Scheduled', label: 'Scheduled' },
            { value: 'InProgress', label: 'In Progress' },
            { value: 'Cancelled', label: 'Cancelled' },
            { value: 'Not Attended', label: 'Not Attended' },
            { value: 'Rescheduled', label: 'Rescheduled' },
        ],
    };

    let totalCreated = 0;
    for (const [category, items] of Object.entries(defaults)) {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const exists = await AppSetting.findOne({ category, value: item.value });
            if (!exists) {
                await AppSetting.create({ ...item, category, sortOrder: i + 1 });
                totalCreated++;
            }
        }
    }
    res.json({ success: true, data: { created: totalCreated } });
});

module.exports = { getSettings, getAllSettings, createSetting, updateSetting, deleteSetting, seedAllDefaults };
