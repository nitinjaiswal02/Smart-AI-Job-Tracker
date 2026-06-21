import mongoose from 'mongoose';

// A small embedded sub-schema for recruiter comments / notes left on an
// application. Notice this does NOT get its own mongoose.model() call —
// it lives only inside Application documents, as an array field.
const commentSchema = new mongoose.Schema(
  {
    author: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const applicationSchema = new mongoose.Schema(
  {
    // A REFERENCE to a User document. We don't store the user's name/email
    // here — just their _id. To get the full user, you'd "populate" this
    // field later (Mongoose's version of a SQL JOIN).
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // every query will filter "give me MY applications" — index this
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Job role/title is required'],
      trim: true,
    },
    jobDescription: {
      type: String, // pasted in by the user; used later for AI resume scoring
    },
    jobUrl: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['wishlist', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'],
        message: '{VALUE} is not a valid application status',
      },
      default: 'applied',
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    interviewDate: {
      type: Date, // used by the cron-based reminder system in Phase 10
    },
    resumeScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    atsIssues: {
      type: [String],
      default: [],
    },
    referralRequested: {
      type: Boolean,
      default: false,
    },
    followUpSentAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
    comments: [commentSchema], // embedded array of recruiter comments
  },
  {
    timestamps: true,
  }
);

// Compound index: most dashboard queries will be "this user's applications,
// filtered/sorted by status" — indexing both fields together makes that
// fast even with thousands of applications in the collection.
applicationSchema.index({ user: 1, status: 1 });

const Application = mongoose.model('Application', applicationSchema);

export default Application;