import mongoose from 'mongoose';

const careerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: {
        values: [
          'Teaching & Education',
          'Operations & Field Management',
          'Youth Development',
          'Monitoring & Evaluation',
          'Finance & Administration',
          'Communications & Fundraising',
        ],
        message: '{VALUE} is not a valid department',
      },
      index: true,
    },
    location: {
      type: String,
      required: [true, 'Job location / school branch is required'],
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['Full-Time', 'Part-Time', 'Contractual', 'Volunteer'],
      default: 'Full-Time',
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    responsibilities: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

careerSchema.index({ status: 1, department: 1 });

const Career = mongoose.model('Career', careerSchema);

export default Career;
