import fs from 'node:fs/promises';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractText(file) {
  const buffer = await fs.readFile(file.path);
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    const result = await pdf(buffer);
    return result.text.replace(/\s+/g, ' ').trim();
  }
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.originalname.toLowerCase().endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.replace(/\s+/g, ' ').trim();
  }
  throw new Error('Only PDF and DOCX files are supported');
}
