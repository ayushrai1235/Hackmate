import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    attachments: [
      {
        publicId: { type: String },
        secureUrl: { type: String },
        url: { type: String },
        name: { type: String },
        type: { type: String }, // e.g., 'image', 'file'
      },
    ],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ chatId: 1, sender: 1, readBy: 1 });


messageSchema.pre('save', function () {
  if (this.attachments && this.attachments.length > 0) {
    this.attachments.forEach((att) => {
      if (att.url && !att.secureUrl) {
        att.secureUrl = att.url;
      }
      if (att.secureUrl && !att.url) {
        att.url = att.secureUrl;
      }
    });
  }
});

const Message = mongoose.model('Message', messageSchema);
export default Message;

