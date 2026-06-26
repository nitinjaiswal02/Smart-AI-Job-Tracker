import groq from '../config/ai.js';
import Application from '../models/Application.js';

// @route   POST /api/ai/score-resume
// Takes resume text + job description, returns a score and feedback.
const scoreResume = async (req, res) => {
  const { resumeText, jobDescription, applicationId } = req.body;

  if (!resumeText || !jobDescription) {
    const error = new Error('Resume text and job description are both required');
    error.statusCode = 400;
    throw error;
  }

  // This is called "prompt engineering" — structuring the message to OpenAI
  // so it returns exactly the format we need (JSON), not a conversational
  // paragraph. The more specific you are about the output format, the more
  // reliably the model follows it. This is a real skill in production AI work.
  const prompt = `
You are an expert technical recruiter and resume coach.

Analyze the following resume against the job description and respond with ONLY a valid JSON object — no explanation, no markdown, no code blocks, just raw JSON.

The JSON must have exactly this structure:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "missingKeywords": ["<keyword 1>", "<keyword 2>"]
}

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}
`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile', // fast and cheap — perfect for this use case
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3, // lower = more consistent, deterministic output
    // We're asking for JSON — we don't want the model to be "creative"
  });

  // The model's reply is always a string — we parse it into a real JS object.
  const rawText = response.choices[0].message.content.trim();

  let result;
  try {
    result = JSON.parse(rawText);
  } catch (e) {
    // Sometimes the model adds a markdown code fence (```json ... ```) despite
    // instructions not to. Strip them and try again before giving up.
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    result = JSON.parse(cleaned);
  }

  // If an applicationId was provided, save the score back to that application
  // document so the dashboard can display it without re-running the AI.
  if (applicationId) {
    await Application.findOneAndUpdate(
      { _id: applicationId, user: req.user._id }, // ownership check
      { resumeScore: result.score },
      { new: true }
    );
  }

  res.status(200).json(result);
};

// @route   POST /api/ai/ats-check
// Checks a resume for ATS compatibility issues.
const atsCheck = async (req, res) => {
  const { resumeText, applicationId } = req.body;

  if (!resumeText) {
    const error = new Error('Resume text is required');
    error.statusCode = 400;
    throw error;
  }

  const prompt = `
You are an ATS (Applicant Tracking System) compatibility expert.

Analyze the following resume for ATS compatibility issues and respond with ONLY a valid JSON object — no explanation, no markdown, no code blocks, just raw JSON.

The JSON must have exactly this structure:
{
  "isATSFriendly": <true or false>,
  "score": <number 0-100 representing ATS compatibility>,
  "issues": ["<specific issue 1>", "<specific issue 2>"],
  "suggestions": ["<specific fix 1>", "<specific fix 2>"],
  "passedChecks": ["<thing that is already good 1>", "<thing that is already good 2>"]
}

Common ATS issues to check for:
- Tables or columns (ATS often can't parse multi-column layouts)
- Images, graphics, or charts
- Non-standard section headings (e.g. "My Journey" instead of "Experience")
- Missing standard sections (Summary, Experience, Education, Skills)
- Headers/footers with important info (ATS may skip them)
- Special characters or symbols in bullet points
- Missing contact information
- No measurable achievements (just job duties listed)
- Very long or very short resume for experience level

RESUME:
${resumeText}
`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  });

  const rawText = response.choices[0].message.content.trim();

  let result;
  try {
    result = JSON.parse(rawText);
  } catch (e) {
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    result = JSON.parse(cleaned);
  }

  // Save issues back to the application document if provided
  if (applicationId) {
    await Application.findOneAndUpdate(
      { _id: applicationId, user: req.user._id },
      { atsIssues: result.issues },
      { new: true }
    );
  }

  res.status(200).json(result);
};

// @route   POST /api/ai/generate-followup
// Generates a personalized follow-up email draft.
// Phase 10 will call this automatically via cron — but exposing it as an
// API endpoint means users can also trigger it manually from the UI.
const generateFollowUp = async (req, res) => {
  const { applicationId } = req.body;

  if (!applicationId) {
    const error = new Error('Application ID is required');
    error.statusCode = 400;
    throw error;
  }

  const application = await Application.findOne({
    _id: applicationId,
    user: req.user._id,
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  const prompt = `
Write a professional, concise follow-up email for a job application.

Details:
- Company: ${application.company}
- Role: ${application.role}
- Applied on: ${application.appliedDate?.toDateString() || 'recently'}
- Current status: ${application.status}

Requirements:
- Keep it under 150 words
- Professional but warm tone
- Express continued interest without being pushy
- Ask about timeline
- Respond with ONLY a JSON object, no markdown:
{
  "subject": "<email subject line>",
  "body": "<full email body with \\n for line breaks>"
}
`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7, // slightly higher here — we want natural-sounding email, not robotic
  });

  const rawText = response.choices[0].message.content.trim();
  let result;
  try {
    result = JSON.parse(rawText);
  } catch (e) {
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    result = JSON.parse(cleaned);
  }

  res.status(200).json(result);
};

export { scoreResume, atsCheck, generateFollowUp };