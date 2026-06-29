import cron from 'node-cron';
import Application from '../models/Application.js';
import User from '../models/User.js';
import sendEmail from './sendEmail.js';
import groq from '../config/ai.js';

// We import getIO lazily inside functions (not at the top level) to avoid
// a circular dependency issue — socket.js imports nothing from here, but
// if we imported getIO at the top level, module initialization order could
// cause getIO to be undefined when cronJobs.js first loads.
const getSocketIO = async () => {
  const { getIO } = await import('../config/socket.js');
  return getIO;
};

// ─── Job 1: Interview Day Reminder ───────────────────────────────────────────
// Runs every day at 8:00 AM.
// Finds all applications where interviewDate is TODAY, and sends both a
// real-time Socket.io notification AND an email to the applicant.
const scheduleInterviewReminders = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running interview reminder job...');

    try {
      const now = new Date();
      // Build a date range for "today" — midnight to midnight
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      const applications = await Application.find({
        interviewDate: { $gte: startOfDay, $lte: endOfDay },
        status: 'interviewing',
      }).populate('user', 'name email'); // JOIN equivalent — gets user.name and user.email

      console.log(`[CRON] Found ${applications.length} interview(s) today`);

      for (const app of applications) {
        const userId = app.user._id.toString();
        const payload = {
          type: 'interview_reminder',
          message: `Interview reminder: ${app.role} at ${app.company} is today!`,
          application: {
            _id: app._id,
            company: app.company,
            role: app.role,
            interviewDate: app.interviewDate,
          },
        };

        // 1) Real-time notification via Socket.io (if user is online)
        try {
          const getIO = await getSocketIO();
          getIO().to(userId).emit('notification:interview-reminder', payload);
          console.log(`[CRON] Socket notification sent to user ${userId}`);
        } catch (socketErr) {
          // User might not be connected — that's fine, email is the fallback
          console.log(`[CRON] User ${userId} not connected via socket`);
        }

        // 2) Email reminder (always sent, regardless of socket connection)
        try {
          await sendEmail({
            to: app.user.email,
            subject: `Interview Reminder: ${app.role} at ${app.company} — Today!`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #0f6e56;">Interview Reminder</h2>
                <p>Hi ${app.user.name},</p>
                <p>You have an interview today!</p>
                <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
                  <tr>
                    <td style="padding: 8px; font-weight: bold; color: #475569;">Company</td>
                    <td style="padding: 8px;">${app.company}</td>
                  </tr>
                  <tr style="background: #f8fafc;">
                    <td style="padding: 8px; font-weight: bold; color: #475569;">Role</td>
                    <td style="padding: 8px;">${app.role}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; font-weight: bold; color: #475569;">Time</td>
                    <td style="padding: 8px;">${new Date(app.interviewDate).toLocaleTimeString()}</td>
                  </tr>
                </table>
                <p style="color: #64748b; font-size: 14px;">Good luck! — Smart Job Tracker</p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error(`[CRON] Email failed for ${app.user.email}:`, emailErr.message);
        }
      }
    } catch (err) {
      console.error('[CRON] Interview reminder job failed:', err.message);
    }
  });

  console.log('[CRON] Interview reminder job scheduled (daily at 8:00 AM)');
};

// ─── Job 2: Stale Application Follow-up ──────────────────────────────────────
// Runs every day at 9:00 AM.
// Finds applications that have been in "applied" status for 14+ days with
// no follow-up sent yet, generates an AI follow-up email draft, and emails
// it to the user (they can review and send it themselves).
const scheduleStaleApplicationReminders = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Running stale application follow-up job...');

    try {
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

      const staleApplications = await Application.find({
        status: 'applied',
        appliedDate: { $lte: fourteenDaysAgo },
        followUpSentAt: { $exists: false }, // hasn't had a follow-up sent yet
      }).populate('user', 'name email');

      console.log(`[CRON] Found ${staleApplications.length} stale application(s)`);

      for (const app of staleApplications) {
        try {
          // Generate a personalized follow-up email using Groq AI
          const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'user',
                content: `
Write a professional follow-up email for a job application.
Company: ${app.company}
Role: ${app.role}
Applied: ${app.appliedDate.toDateString()}

Keep it under 120 words, warm but professional tone.
Return ONLY a JSON object:
{"subject": "<subject>", "body": "<body with \\n for line breaks>"}
`,
              },
            ],
            temperature: 0.7,
          });

          const rawText = response.choices[0].message.content.trim();
          let emailDraft;
          try {
            emailDraft = JSON.parse(rawText);
          } catch {
            const cleaned = rawText.replace(/```json|```/g, '').trim();
            emailDraft = JSON.parse(cleaned);
          }

          // Email the draft to the USER (not the recruiter!) so they can
          // review and send it themselves — we never auto-send to recruiters.
          await sendEmail({
            to: app.user.email,
            subject: `Follow-up draft ready: ${app.role} at ${app.company}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #0f6e56;">Follow-up Email Draft</h2>
                <p>Hi ${app.user.name},</p>
                <p>It's been 14+ days since you applied for <strong>${app.role}</strong>
                   at <strong>${app.company}</strong>. Here's a follow-up email draft:</p>

                <div style="background: #f8fafc; border-left: 4px solid #0f6e56;
                            padding: 16px; margin: 16px 0; border-radius: 4px;">
                  <p style="font-weight:bold; margin:0 0 8px;">
                    Subject: ${emailDraft.subject}
                  </p>
                  <p style="white-space: pre-line; margin: 0; color: #334155;">
                    ${emailDraft.body}
                  </p>
                </div>

                <p style="color: #64748b; font-size: 13px;">
                  Review, personalize, and send this yourself.
                  — Smart Job Tracker
                </p>
              </div>
            `,
          });

          // Mark follow-up as sent so this application isn't processed again
          await Application.findByIdAndUpdate(app._id, {
            followUpSentAt: new Date(),
          });

          console.log(`[CRON] Follow-up draft emailed for ${app.role} @ ${app.company}`);
        } catch (appErr) {
          console.error(`[CRON] Failed for application ${app._id}:`, appErr.message);
          // Continue processing other applications even if one fails
        }
      }
    } catch (err) {
      console.error('[CRON] Stale application job failed:', err.message);
    }
  });

  console.log('[CRON] Stale application job scheduled (daily at 9:00 AM)');
};

// ─── Initialize all cron jobs ─────────────────────────────────────────────────
// Called once from server.js at startup
const initCronJobs = () => {
  scheduleInterviewReminders();
  scheduleStaleApplicationReminders();
  console.log('[CRON] All jobs initialized');
};

export default initCronJobs;