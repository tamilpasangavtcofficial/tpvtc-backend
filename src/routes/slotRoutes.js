const express = require('express');
const { EventSlot, EventSlotImage, BookingRequest, AttendingEventSlot, User } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get Slots for an Event
router.get('/:event_id', async (req, res) => {
    try {
        const { event_id } = req.params;
        const slots = await EventSlot.findAll({ 
            where: { event_id },
            include: [
                { model: EventSlotImage },
                { 
                    model: BookingRequest, 
                    where: { status: 'pending' }, 
                    required: false 
                }
            ]
        });
        res.json(slots);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// (Admin) Get All Booking Requests
router.get('/requests', auth, adminOnly, async (req, res) => {
    try {
        const requests = await BookingRequest.findAll();
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// Book a Slot
router.post('/book', async (req, res) => {
    try {
        const { vtc_name, vtc_member_count, discord_username, vtc_role, vtc_link, event_id, event_slot_id } = req.body;
        
        // Check if slot is already booked
        const slot = await EventSlot.findByPk(event_slot_id);
        if (!slot || slot.booked_by) {
            return res.status(400).json({ message: 'Slot not available' });
        }
        
        const request = await BookingRequest.create({
            vtc_name,
            vtc_member_count,
            discord_username,
            vtc_role,
            vtc_link,
            event_id,
            event_slot_id
        });
        
        res.status(201).json(request);
    } catch (err) {
        console.error('CRITICAL ERROR IN /book:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// (Admin) Approve/Reject Request
router.put('/request/:id', auth, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'
        
        const request = await BookingRequest.findByPk(id);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        
        if (status === 'approved') {
            const slot = await EventSlot.findByPk(request.event_slot_id);
            await slot.update({ booked_by: request.vtc_name });
        }
        
        await request.update({ status });
        res.json(request);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve a request
router.post('/approve/:request_id', auth, adminOnly, async (req, res) => {
    try {
        const { request_id } = req.params;
        const request = await BookingRequest.findByPk(request_id);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        // Fallback: If username is missing from token (prior to relogin), fetch it from DB
        let processorName = req.user.username;
        if (!processorName) {
            const adminUser = await User.findByPk(req.user.id);
            processorName = adminUser?.username || 'SYSTEM';
        }

        // Update the actual slot
        await EventSlot.update(
            { booked_by: request.vtc_name },
            { where: { id: request.event_slot_id } }
        );

        // Update status and auditor
        await request.update({ 
            status: 'approved',
            processed_by: processorName 
        });

        res.json({ message: 'Slot approved successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to approve' });
    }
});

// Reject a request
router.post('/reject/:request_id', auth, adminOnly, async (req, res) => {
    try {
        const { request_id } = req.params;
        const request = await BookingRequest.findByPk(request_id);
        if (!request) return res.status(404).json({ error: 'Request not found' });

        // Fallback: If username is missing from token (prior to relogin), fetch it from DB
        let processorName = req.user.username;
        if (!processorName) {
            const adminUser = await User.findByPk(req.user.id);
            processorName = adminUser?.username || 'SYSTEM';
        }

        // Update status and auditor
        await request.update({ 
            status: 'rejected',
            processed_by: processorName
        });

        res.json({ message: 'Slot rejected successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to reject' });
    }
});

// Get pending requests
router.get('/requests/pending', async (req, res) => {
    try {
        const requests = await BookingRequest.findAll({
            where: { status: 'pending' },
            include: [
                {
                    model: EventSlot,
                    include: [{ model: EventSlotImage }]
                }
            ]
        });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
});

// Get all request logs
router.get('/requests/logs', async (req, res) => {
    try {
        const requests = await BookingRequest.findAll({
            include: [
                {
                    model: EventSlot,
                    include: [{ model: EventSlotImage }]
                }
            ],
            order: [['updatedAt', 'DESC']]
        });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch request logs' });
    }
});

// Upsert attending slot info
router.post('/attending/upsert', async (req, res) => {
    try {
        const { event_id, slot_number, slot_url } = req.body;
        const [slot, created] = await AttendingEventSlot.upsert({
            event_id,
            slot_number,
            slot_url
        });
        res.json({ message: 'Attending slot updated', slot });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update attending slot' });
    }
});

// Get allocated slot for attending event
router.get('/attending/:event_id', async (req, res) => {
    try {
        const { event_id } = req.params;
        const slot = await AttendingEventSlot.findOne({ where: { event_id } });
        res.json(slot);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch attending slot' });
    }
});

// Setup Official Event Slots & Map
router.post('/official/setup', async (req, res) => {
    const { event_id, slot_url, slot_name, from = 1, to = 20 } = req.body;
    try {
        const start = parseInt(from);
        const end = parseInt(to);

        // 1. Create or Update Slot Image entry for this URL + NAME (to keep sectors distinct)
        const [slotImage, created] = await EventSlotImage.findOrCreate({
            where: { slot_url, slot_name },
            defaults: { total_slots: (end - start + 1) }
        });

        if (!created) {
            await slotImage.update({ total_slots: (end - start + 1) });
        }

        // 2. Clean up existing slots in THIS SPECIFIC RANGE for this event
        const { Op } = require('sequelize');
        // We use an array of exact lot numbers to avoid lexical range comparison bugs
        const preciseLots = [];
        for (let i = start; i <= end; i++) preciseLots.push(i.toString());

        await EventSlot.destroy({ 
            where: { 
                event_id,
                slot_no: { [Op.in]: preciseLots }
            } 
        });

        // 3. Generate individual Slot entries
        const slots = [];
        for (let i = start; i <= end; i++) {
            slots.push({
                slot_no: i.toString(),
                event_id,
                slot_image_id: slotImage.id,
                booked_by: null
            });
        }
        await EventSlot.bulkCreate(slots);

        res.json({ message: `Slots #${start} to #${end} setup successfully!`, slot_image_id: slotImage.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error setting up slots' });
    }
});
// Get Slots for an Official Event
router.get('/:event_id', async (req, res) => {
    try {
        const slots = await EventSlot.findAll({ 
            where: { event_id: req.params.event_id },
            include: [{ model: EventSlotImage }]
        });
        res.json(slots);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching slots' });
    }
});

// Manual Clear Slot
router.post('/clear/:slot_id', auth, adminOnly, async (req, res) => {
    try {
        const { slot_id } = req.params;
        await EventSlot.update({ booked_by: null }, { where: { id: slot_id } });
        
        // Optionally update any associated BookingRequest too
        // await BookingRequest.update({ status: 'rejected' }, { where: { event_slot_id: slot_id, status: 'approved' } });

        res.json({ message: 'Slot booking cleared successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error clearing slot' });
    }
});

// Manual Assign Slot
router.post('/assign/:slot_id', auth, adminOnly, async (req, res) => {
    try {
        const { slot_id } = req.params;
        const { vtc_name } = req.body;
        if (!vtc_name) return res.status(400).json({ message: 'VTC name required' });
        
        await EventSlot.update({ booked_by: vtc_name }, { where: { id: slot_id } });
        res.json({ message: 'Slot manually assigned successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error assigning slot' });
    }
});

module.exports = router;
