import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema(
  {
    userA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    matchedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt too, though matchedAt exists
  }
);

// Enforce unique matches between any two users
// Wait, to be truly unique regardless of order, we could ensure userA < userB before saving,
// but indexing userA and userB together enforces it if the app logic stores them consistently.
matchSchema.index({ userA: 1, userB: 1 }, { unique: true });

const Match = mongoose.model('Match', matchSchema);
export default Match;
