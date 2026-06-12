import mongoose from 'mongoose';

const swipeSchema = new mongoose.Schema(
  {
    swiper: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    target: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, enum: ['left', 'right', 'super'], required: true },
  },
  {
    timestamps: true,
  }
);

// Compound unique index so a user can't swipe on the same target twice
swipeSchema.index({ swiper: 1, target: 1 }, { unique: true });

const Swipe = mongoose.model('Swipe', swipeSchema);
export default Swipe;
