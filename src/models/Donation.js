import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donorName: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true,
    },
    donorEmail: {
      type: String,
      required: [true, 'Donor email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Donation amount is required'],
      min: [1, 'Donation amount must be at least 1'],
    },
    currency: {
      type: String,
      default: 'BDT',
      uppercase: true,
      trim: true,
    },
    frequency: {
      type: String,
      required: [true, 'Donation frequency is required'],
      enum: {
        values: ['one-time', 'monthly'],
        message: '{VALUE} is not a valid frequency',
      },
    },
    causeCategory: {
      type: String,
      required: [true, 'Cause category is required'],
      trim: true,
      index: true,
      // Examples: 'Disaster Relief', 'Classroom Upgrade', 'General Fund', 'Child Education'
    },
    paymentGateway: {
      type: String,
      required: [true, 'Payment gateway is required'],
      enum: {
        values: ['sslcommerz', 'bkash'],
        message: '{VALUE} is not a supported payment gateway',
      },
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'success', 'failed'],
        message: '{VALUE} is not a valid donation status',
      },
      default: 'pending',
      index: true,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for analytics and reporting
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ donorEmail: 1, status: 1 });
donationSchema.index({ causeCategory: 1, status: 1 });

const Donation = mongoose.model('Donation', donationSchema);

export default Donation;
