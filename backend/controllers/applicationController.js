import Application from '../models/Application.js';
import { getIO } from '../config/socket.js';

// Creates a new application for the LOGGED-IN user. We never trust a
// `user` field from the request body for this — req.user._id (set by the
// `protect` middleware from the verified JWT) is the only source of truth
// for "who owns this." Otherwise anyone could create an application under
// someone else's account just by editing the request body.
const createApplication = async (req, res) => {
  const { company, role, jobDescription, jobUrl, location, status, appliedDate, notes } = req.body;

  if (!company || !role) {
    const error = new Error('Company and role are required');
    error.statusCode = 400;
    throw error;
  }

  const application = await Application.create({
    user: req.user._id,
    company,
    role,
    jobDescription,
    jobUrl,
    location,
    status,
    appliedDate,
    notes,
  });

  res.status(201).json(application);
};

// Supports filtering by status and a free-text search across company/role,
// plus pagination — because a student with 150 applications should never
// get all 150 back in one response.
const getApplications = async (req, res) => {
  const { status, search, page = 1, limit = 20, sort = '-createdAt' } = req.query;

  // ALWAYS scope to the logged-in user first. This is the single most
  // important line in this entire file — without it, this endpoint would
  // leak every user's applications to every other user.
  const query = { user: req.user._id };

  if (status) {
    query.status = status;
  }

  if (search) {
    // $or means "match if EITHER condition is true." $regex with the 'i'
    // option does a case-insensitive partial match — basically a SQL
    // `LIKE '%search%'` across two columns at once.
    query.$or = [
      { company: { $regex: search, $options: 'i' } },
      { role: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // cap at 100 to prevent abuse
  const skip = (pageNum - 1) * limitNum;

  // Run the count and the actual fetch in parallel rather than sequentially
  // — they're independent queries, no reason to make the client wait twice.
  const [applications, total] = await Promise.all([
    Application.find(query).sort(sort).skip(skip).limit(limitNum),
    Application.countDocuments(query),
  ]);

  res.status(200).json({
    applications,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
};

const getApplicationById = async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    user: req.user._id, // ownership check baked right into the query
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json(application);
};

const updateApplication = async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  // Whitelist which fields can actually be updated, rather than blindly
  // doing Object.assign(application, req.body). This stops a client from
  // sneaking in something like { isPremium: true } or { user: otherId }
  // through this endpoint.
  const updatableFields = [
    'company', 'role', 'jobDescription', 'jobUrl', 'location',
    'status', 'appliedDate', 'interviewDate', 'notes',
    'resumeScore', 'atsIssues', 'referralRequested', 'followUpSentAt',
  ];

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      application[field] = req.body[field];
    }
  });

  // .save() (not findByIdAndUpdate) so our schema validators and any future
  // pre-save hooks on Application still run on this update.
  const updated = await application.save();

  // Broadcast the update to all of this user's connected browser tabs/devices.
  // getIO().to(userId) sends ONLY to sockets in that user's room —
  // other users' dashboards are completely unaffected.
  try {
    getIO().to(req.user._id.toString()).emit('application:updated', updated);
  } catch (e) {
    // If socket server isn't available, the HTTP response still succeeds.
    // Real-time is a "nice to have" enhancement, not a hard dependency.
  }

  res.status(200).json(updated);
};

const deleteApplication = async (req, res) => {
  const application = await Application.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({ message: 'Application deleted', id: req.params.id });
};

// Adds a recruiter comment to an application's embedded comments array —
// this is the data layer that Phase 9's real-time feature will broadcast
// over Socket.io.
const addComment = async (req, res) => {
  const { author, text } = req.body;

  if (!author || !text) {
    const error = new Error('Comment author and text are required');
    error.statusCode = 400;
    throw error;
  }

  const application = await Application.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!application) {
    const error = new Error('Application not found');
    error.statusCode = 404;
    throw error;
  }

  application.comments.push({ author, text });
  await application.save();

  try { // Broadcast the new comment to all of this user's connected browser tabs/devices.
    getIO()
      .to(req.user._id.toString())
      .emit('application:comment-added', {
        applicationId: application._id,
        comment: application.comments[application.comments.length - 1],
      });
  } catch (e) {}

  res.status(201).json(application.comments[application.comments.length - 1]);
};

export {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  addComment,
};