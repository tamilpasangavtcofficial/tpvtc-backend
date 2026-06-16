const UserRole = require('./UserRole');
const User = require('./User');
const AttendingEventSlot = require('./AttendingEventSlot');
const EventSlotImage = require('./EventSlotImage');
const EventSlot = require('./EventSlot');
const BookingRequest = require('./BookingRequest');
const HeaderImage = require('./HeaderImage');
const GalleryImage = require('./GalleryImage');
const Supporter = require('./Supporter');

const Achievement = require('./Achievement');
const Magazine = require('./Magazine');
const MagazineNews = require('./MagazineNews');

// Associations
BookingRequest.belongsTo(EventSlot, { foreignKey: 'event_slot_id' });
EventSlot.hasMany(BookingRequest, { foreignKey: 'event_slot_id' });

EventSlot.belongsTo(EventSlotImage, { foreignKey: 'slot_image_id' });
EventSlotImage.hasMany(EventSlot, { foreignKey: 'slot_image_id' });

Magazine.hasMany(MagazineNews, { foreignKey: 'magazine_id', as: 'news', onDelete: 'CASCADE' });
MagazineNews.belongsTo(Magazine, { foreignKey: 'magazine_id' });

module.exports = {
    UserRole,
    User,
    AttendingEventSlot,
    EventSlotImage,
    EventSlot,
    BookingRequest,
    HeaderImage,
    GalleryImage,
    Supporter,
    Achievement,
    Magazine,
    MagazineNews
};
