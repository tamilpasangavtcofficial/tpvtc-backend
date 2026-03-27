const UserRole = require('./UserRole');
const User = require('./User');
const AttendingEventSlot = require('./AttendingEventSlot');
const EventSlotImage = require('./EventSlotImage');
const EventSlot = require('./EventSlot');
const BookingRequest = require('./BookingRequest');
const HeaderImage = require('./HeaderImage');
const GalleryImage = require('./GalleryImage');

// Associations
BookingRequest.belongsTo(EventSlot, { foreignKey: 'event_slot_id' });
EventSlot.hasMany(BookingRequest, { foreignKey: 'event_slot_id' });

EventSlot.belongsTo(EventSlotImage, { foreignKey: 'slot_image_id' });
EventSlotImage.hasMany(EventSlot, { foreignKey: 'slot_image_id' });

module.exports = {
    UserRole,
    User,
    AttendingEventSlot,
    EventSlotImage,
    EventSlot,
    BookingRequest,
    HeaderImage,
    GalleryImage
};
