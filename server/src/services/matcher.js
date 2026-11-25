// Transparent baseline matcher. This is a heuristic, not a real ATS score.
const SKILLS = [
  'c++','java','javascript','typescript','python','react','node.js','express',
  'mongodb','mysql','postgresql','redis','kafka','html','css','tailwind',
  'rest api','git','docker','aws','azure','data structures','algorithms',
  'system design','oops','object oriented programming','computer networks',
  'operating systems','dbms','machine learning','generative ai','llm','rag',
  'langchain','communication','problem solving'
];

const normalize = s => s.toLowerCase().replace(/[^\w+#. ]/g, ' ').replace(/\s+/g, ' ').trim();

export function analyzeMatch(resumeText, jobDescription) {
  const resume = normalize(resumeText);
  const job = normalize(jobDescription);
  const found = SKILLS.filter(skill => {
    const term = normalize(skill);
    return new RegExp(`(^| )${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($| )`, 'i').test(job);
  });
  const matchedSkills = found.filter(skill => resume.includes(normalize(skill)));
  const missingSkills = found.filter(skill => !resume.includes(normalize(skill)));
  const score = found.length ? Math.round((matchedSkills.length / found.length) * 100) : 0;

  return {
    score,
    matchedSkills,
    missingSkills,
    preferredMissingSkills: [],
    summary: found.length
      ? `Matched ${matchedSkills.length} of ${found.length} recognized skills mentioned in the job description.`
      : 'No recognized skills were detected in the job description. Add clearer skill requirements for a more useful comparison.',
    suggestions: missingSkills.length
      ? [`If you genuinely have experience with ${missingSkills.slice(0, 3).join(', ')}, make it easier to find in your resume.`,
         'Add measurable outcomes to relevant project and experience bullets.',
         'Tailor your project descriptions to the responsibilities in this job description.']
      : ['Your resume contains the recognized skills found in this job description.',
         'Add measurable outcomes and concrete project evidence to strengthen your application.']
  };
}
