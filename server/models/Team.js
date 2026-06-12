import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    logo: {
      publicId: { type: String },
      secureUrl: { type: String },
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    requiredRoles: [{ type: String }],
    teamHealthScore: { type: Number, default: 0 },
    hackathonName: { type: String },
    joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    invites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

const Team = mongoose.model('Team', teamSchema);
export default Team;
