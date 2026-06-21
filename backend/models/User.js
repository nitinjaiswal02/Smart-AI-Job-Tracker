import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true, // strips leading/trailing whitespace automatically
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // creates a unique index — no two users can share an email
      lowercase: true, // normalizes "Bob@Email.com" -> "bob@email.com"
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // excludes this field from query results BY DEFAULT
      // (you have to explicitly ask for it with .select('+password').
      // This means a stray `res.json(user)` somewhere in your code can
      // never accidentally leak a password hash to the client.)
    },
    isPremium: {
      type: Boolean,
      default: false, // used in Phase 11 (monetization)
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
);

// --- Pre-save hook ---
// This function runs automatically every time a User document is about to
// be saved to the database (on .save(), which create() also calls under
// the hood). It's how we make sure we NEVER store a plain-text password.
//
// IMPORTANT: this must be a regular `function`, not an arrow function.
// Arrow functions don't get their own `this` — they inherit it from
// whatever scope they were defined in. We need `this` to refer to the
// specific user document being saved, which only a regular function gives us.
userSchema.pre('save', async function (next) {
  // Only re-hash the password if it was actually changed. Without this
  // check, updating a user's name would also re-hash an ALREADY-hashed
  // password, corrupting it and locking the user out.
  if (!this.isModified('password')) {
    return next();
  }

  // bcrypt.genSalt generates random data mixed into the hash so that two
  // users with the same password ("123456") don't end up with identical
  // hashes in the database. 10 rounds is a solid, widely-used default —
  // higher = slower to compute = more resistant to brute force, but also
  // slower for legitimate logins.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Instance method ---
// Available on any user document, e.g. `const isMatch = await user.comparePassword('input123')`.
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;