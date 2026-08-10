const QRCode = require('qrcode');

const generateQRCode = async(data) => {
    try {
        const qrCode = await QRCode.toDataURL(JSON.stringify(data));
        return qrCode;
    } catch (error) {
        console.error('QR Generation Error:', error);
        throw error;
    }
};

const generateQRForEvent = async(eventId, userId) => {
    const data = {
        eventId,
        userId,
        timestamp: Date.now(),
        type: 'event_checkin'
    };
    return await generateQRCode(data);
};

module.exports = { generateQRCode, generateQRForEvent };