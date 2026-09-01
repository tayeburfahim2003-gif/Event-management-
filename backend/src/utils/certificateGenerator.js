const PDFDocument = require('pdfkit');

// ============================================
// GENERATE CERTIFICATE PDF (as base64 data URI)
// ============================================
const generateCertificate = (user, event) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
            const buffers = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                const base64Pdf = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
                resolve(base64Pdf);
            });
            doc.on('error', (error) => reject(error));

            // Decorative border
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
                .lineWidth(3)
                .stroke('#2e7d32');

            doc.fontSize(28)
                .fillColor('#2e7d32')
                .text('Certificate of Participation', 0, 100, { align: 'center' });

            doc.moveDown(2);
            doc.fontSize(16)
                .fillColor('#333333')
                .text('This is to certify that', { align: 'center' });

            doc.moveDown(0.5);
            doc.fontSize(24)
                .fillColor('#000000')
                .text(user.name, { align: 'center', underline: true });

            doc.moveDown(0.5);
            doc.fontSize(16)
                .fillColor('#333333')
                .text('has successfully participated in', { align: 'center' });

            doc.moveDown(0.5);
            doc.fontSize(20)
                .fillColor('#000000')
                .text(event.title, { align: 'center' });

            doc.moveDown(0.5);
            doc.fontSize(12)
                .fillColor('#555555')
                .text(
                    `Held on ${new Date(event.startDate).toLocaleDateString()} at ${event.venue}`, { align: 'center' }
                );

            doc.moveDown(3);
            doc.fontSize(12)
                .fillColor('#333333')
                .text('Green University Events Team', { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateCertificate };