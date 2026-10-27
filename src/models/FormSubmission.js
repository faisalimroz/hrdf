import mongoose from 'mongoose';

const formSubmissionSchema = new mongoose.Schema(
  {
    formType: {
      type: String,
      required: true,
      enum: {
        values: ['volunteer', 'partner', 'teacher', 'internship'],
        message: '{VALUE} is not an authorized form type',
      },
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'contacted', 'archived'],
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

formSubmissionSchema.index({ formType: 1, createdAt: -1 });

const FormSubmission = mongoose.model('FormSubmission', formSubmissionSchema);

export default FormSubmission;
