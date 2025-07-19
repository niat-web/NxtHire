// server/routes/public.routes.js
const express = require('express');
const {
    verifyEmail,
    getAvailableSlots,
    bookSlot
} = require('../controllers/public.controller');

const router = express.Router();

// No 'protect' middleware here since these routes must be public
router.post('/verify-email', verifyEmail);
router.get('/:publicId/slots', getAvailableSlots);
router.post('/:publicId/book', bookSlot);

module.exports = router;