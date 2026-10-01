const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outPath = path.resolve(__dirname, '..', 'upload-fixture.pdf');
const doc = new PDFDocument({ size: 'A4', margin: 50 });
const stream = fs.createWriteStream(outPath);

doc.pipe(stream);
doc.fontSize(22).text('Data Structures Study Notes', 50, 50);
doc.moveDown();
doc.fontSize(14).text('This document was generated to confirm that an uploaded PDF can be converted into a study material.');
doc.moveDown();
doc.text('A data structure is a way of organizing information so that it can be stored and retrieved efficiently.');
doc.text('Common structures include arrays, stacks, queues, linked lists, trees, and graphs.');
doc.text('Choosing the right structure affects both the speed and memory usage of an algorithm.');
doc.text('Understanding trade-offs is essential for building efficient software systems.');
doc.end();

stream.on('finish', () => {
  console.log('Created PDF:', outPath);
});
