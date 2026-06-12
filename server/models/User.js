import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    avatar: {
      publicId: { type: String },
      secureUrl: { type: String },
    },
    bio: { type: String },
    college: { type: String },
    city: { type: String },
    yearOfStudy: { type: String },
    role: { type: String, enum: ['Developer', 'Designer', 'Product Manager', 'Other'] },
    experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    skills: [{ type: String }],
    techStack: [{ type: String }],
    githubUsername: { type: String },
    githubScore: { type: Number, default: 0 },
    githubData: {
      repos: { type: Number, default: 0 },
      stars: { type: Number, default: 0 },
      languages: { type: mongoose.Schema.Types.Mixed },
      contributions: { type: Number, default: 0 },
    },
    lookingFor: [{ type: String }],
    availability: { type: String },
    profileVisibility: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    onboardingComplete: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
    status: { type: String, enum: ['Online', 'Offline'], default: 'Offline' },
    superLikesRemaining: { type: Number, default: 3 },
    superLikesResetAt: { type: Date },
    googleId: { type: String },
    githubId: { type: String },
  },
  {
    timestamps: true,
  }
);

// Exclude passwordHash from JSON serialization
userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.passwordHash;
    return ret;
  },
});

// Indexes for common queries
userSchema.index({ googleId: 1 });
userSchema.index({ githubId: 1 });

const User = mongoose.model('User', userSchema);
export default User;
