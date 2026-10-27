import mongoose from 'mongoose';

const childSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Child name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    age: {
      type: Number,
      required: [true, 'Child age is required'],
      min: [1, 'Age must be at least 1'],
      max: [25, 'Age cannot exceed 25'],
    },
    location: {
      type: String,
      required: [true, 'Location or branch name is required'],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['male', 'female', 'other'],
        message: '{VALUE} is not a valid gender',
      },
    },
    story: {
      type: String,
      required: [true, 'Child biography and aspirations are required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Child photograph URL is required'],
      trim: true,
    },
    sponsoredStatus: {
      type: Boolean,
      default: false,
      index: true,
    },
    currentSponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    currentDonorEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for fast filtering on child sponsorship directory
childSchema.index({ sponsoredStatus: 1, location: 1 });
childSchema.index({ sponsoredStatus: 1, gender: 1 });

const Child = mongoose.model('Child', childSchema);

export default Child;
