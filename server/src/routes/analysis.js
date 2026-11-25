import { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { requireAuth } from '../middleware/auth.js';
import Analysis from '../models/Analysis.js';
import { extractText } from '../services/resume.js';
import { analyzeMatch } from '../services/matcher.js';
import { generateFeedback } from '../services/llm.js';

const router = Router();
const uploadDir = path.resolve('uploads');
await fs.mkdir(uploadDir, { recursive: true });
const maxBytes = Number(process.env.MAX_FILE_MB || 5) * 1024 * 1024;

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
  }),
  limits: { fileSize: maxBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ['.pdf', '.docx'].includes(ext));
  }
});

router.post('/', requireAuth, upload.single('resume'), async (req, res, next) => {
  let filePath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ message: 'Upload a PDF or DOCX resume' });
    const jobDescription = req.body.jobDescription?.trim();
    const jobTitle = req.body.jobTitle?.trim() || 'Untitled role';
    if (!jobDescription || jobDescription.length < 30)
      return res.status(400).json({ message: 'Job description must contain at least 30 characters' });

    const resumeText = await extractText(req.file);
    if (resumeText.length < 80) return res.status(400).json({ message: 'Could not extract enough text. Try a text-based PDF or DOCX.' });

    const result = analyzeMatch(resumeText, jobDescription);
    let aiFeedback = null;
    try { aiFeedback = await generateFeedback(resumeText, jobDescription, result); }
    catch (e) { console.error('LLM feedback unavailable:', e.message); }

    const analysis = await Analysis.create({
      user: req.userId, fileName: req.file.originalname, jobTitle,
      score: result.score, matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills, summary: aiFeedback?.summary || result.summary,
      suggestions: Array.isArray(aiFeedback?.suggestions) ? aiFeedback.suggestions : result.suggestions,
      resumeText, jobDescription
    });
    res.status(201).json({ analysis: publicAnalysis(analysis), aiEnhanced: Boolean(aiFeedback) });
  } catch (e) { next(e); }
  finally { if (filePath) await fs.unlink(filePath).catch(() => {}); }
});

function publicAnalysis(a) {
  return {
    id: a.id, fileName: a.fileName, jobTitle: a.jobTitle, score: a.score,
    matchedSkills: a.matchedSkills, missingSkills: a.missingSkills,
    summary: a.summary, suggestions: a.suggestions, createdAt: a.createdAt
  };
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const items = await Analysis.find({ user: req.userId }).sort({ createdAt: -1 }).limit(30);
    res.json({ analyses: items.map(publicAnalysis) });
  } catch (e) { next(e); }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const item = await Analysis.findOne({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ message: 'Analysis not found' });
    res.json({ analysis: publicAnalysis(item) });
  } catch (e) { next(e); }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const item = await Analysis.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ message: 'Analysis not found' });
    res.json({ message: 'Analysis deleted' });
  } catch (e) { next(e); }
});

export default router;
