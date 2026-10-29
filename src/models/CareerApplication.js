import mongoose from 'mongoose';

const careerApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Career',
      required: [true, 'Job circular reference is required'],
      index: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Applicant full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Applicant email address is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Applicant contact number is required'],
      trim: true,
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume / CV file or link is required'],
      trim: true,
    },
    coverLetter: {
      type: String,
      default: '',
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    expectedSalary: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'reviewed', 'shortlisted', 'rejected'],
        message: '{VALUE} is not a valid application status',
      },
      default: 'pending',
      index: true,
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

careerApplicationSchema.index({ jobId: 1, createdAt: -1 });

const CareerApplication = mongoose.model('CareerApplication', careerApplicationSchema);

export default CareerApplication;
