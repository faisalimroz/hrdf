import mongoose from 'mongoose';

const sponsorshipHistorySchema = new mongoose.Schema(
  {
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      required: [true, 'Child reference is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    donorEmail: {
      type: String,
      required: [true, 'Donor email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    donorName: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'cancelled', 'completed'],
        message: '{VALUE} is not a valid sponsorship status',
      },
      default: 'active',
      index: true,
    },
    totalContribution: {
      type: Number,
      default: 0,
      min: [0, 'Total contribution cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for querying a donor's active sponsorships
sponsorshipHistorySchema.index({ donorEmail: 1, status: 1 });
sponsorshipHistorySchema.index({ childId: 1, status: 1 });

const SponsorshipHistory = mongoose.model('SponsorshipHistory', sponsorshipHistorySchema);

export default SponsorshipHistory;
