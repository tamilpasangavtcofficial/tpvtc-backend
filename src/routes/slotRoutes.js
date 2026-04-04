const express = require('express');
const { EventSlot, EventSlotImage, BookingRequest, AttendingEventSlot, User } = require('../models');
const { auth, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');
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

// Setup/Update attending slot info
router.post('/attending/setup', auth, adminOnly, async (req, res) => {
    try {
        const { event_id, slot_number, slot_url } = req.body;
        const numericEventId = parseInt(event_id);
        
        if (!numericEventId) {
            return res.status(400).json({ error: 'Valid Event ID is required' });
        }
        
        // Find existing record for this event
        let record = await AttendingEventSlot.findOne({ where: { event_id: numericEventId } });
        
        if (record) {
            // Update existing
            await record.update({
                slot_number,
                slot_url
            });
        } else {
            // Create new
            record = await AttendingEventSlot.create({
                event_id: numericEventId,
                slot_number,
                slot_url
            });
        }
        
        res.json({ message: 'Attending slot updated', slot: record });
    } catch (err) {
        console.error('ERROR IN /attending/setup:', err);
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

// Setup Official Event Slots & Map (RE-DESIGNED)
router.post('/official/setup', auth, adminOnly, async (req, res) => {
    const { sector_id, event_id, slot_url, slot_name, from = 1, to = 20 } = req.body;
    try {
        const start = parseInt(from);
        const end = parseInt(to);
        const eventId = parseInt(event_id);

        if (isNaN(start) || isNaN(end) || !slot_url) {
            return res.status(400).json({ message: 'Invalid setup parameters' });
        }

        // 1. Prepare the exact slot numbers for this sector
        const preciseLots = [];
        for (let i = start; i <= end; i++) preciseLots.push(i.toString());

        let sector;
        if (sector_id) {
            // EDIT MODE: Update existing sector by its unique ID
            sector = await EventSlotImage.findByPk(sector_id);
            if (!sector) return res.status(404).json({ message: 'Target sector not found' });
            await sector.update({ slot_url, slot_name, total_slots: (end - start + 1), event_id: eventId });
        } else {
            // NEW MODE: Create or find by properties
            const [newSector, created] = await EventSlotImage.findOrCreate({
                where: { event_id: eventId, slot_url, slot_name },
                defaults: { total_slots: (end - start + 1) }
            });
            sector = newSector;
            if (!created) await sector.update({ total_slots: (end - start + 1) });
        }

        // 2. COLLISION CHECK: Are any of these slots already used by ANOTHER sector in this event?
        const collisions = await EventSlot.findAll({
            where: {
                event_id: eventId,
                slot_no: { [Op.in]: preciseLots },
                slot_image_id: { [Op.ne]: sector.id } // Different sector
            }
        });

        if (collisions.length > 0) {
            const list = collisions.slice(0, 3).map(s => `#${s.slot_no}`).join(', ');
            return res.status(400).json({ 
                message: `Overlap detected! Slots ${list}${collisions.length > 3 ? '...' : ''} are already assigned to another parking zone.` 
            });
        }

        // 3. REFRESH Slots for this specific sector only
        await EventSlot.destroy({ where: { slot_image_id: sector.id } });

        // 4. Batch Create the new slots
        const slotsToCreate = preciseLots.map(no => ({
            slot_no: no,
            event_id: eventId,
            slot_image_id: sector.id,
            booked_by: null
        }));

        await EventSlot.bulkCreate(slotsToCreate);

        res.json({ message: `Parking zone "${slot_name}" updated with ${slotsToCreate.length} slots.`, sector_id: sector.id });
    } catch (err) {
        console.error('CRITICAL SETUP ERROR:', err);
        res.status(500).json({ message: 'Server failure during slot generation' });
    }
});

// Delete a complete Parking Zone (Sector)
router.delete('/official/sector/:id', auth, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Check for active bookings in this sector first
        const activeBookings = await EventSlot.findOne({
            where: { slot_image_id: id, booked_by: { [Op.ne]: null } }
        });

        if (activeBookings) {
            return res.status(400).json({ message: 'Cannot delete sector: Some slots are already reserved by VTCs.' });
        }

        // 2. Delete slots and the sector record
        await EventSlot.destroy({ where: { slot_image_id: id } });
        await EventSlotImage.destroy({ where: { id } });

        res.json({ message: 'Parking zone and its slots removed successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to remove sector' });
    }
});
// Clear/Assign Manual Overrides

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

// Update just the Sector Name (New)
router.patch('/official/sector/name/:id', auth, adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const { slot_name } = req.body;
        if (!slot_name) return res.status(400).json({ message: 'Name is required' });
        
        const sector = await EventSlotImage.findByPk(id);
        if (!sector) return res.status(404).json({ message: 'Sector not found' });
        
        await sector.update({ slot_name });
        res.json({ message: 'Sector name updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update sector name' });
    }
});

module.exports = router;

