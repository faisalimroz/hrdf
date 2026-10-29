import mongoose from 'mongoose';

const schoolBranchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'School branch name is required'],
      trim: true,
      maxlength: [150, 'Branch name cannot exceed 150 characters'],
    },
    location: {
      type: String,
      required: [true, 'Branch address or location is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District / Division is required'],
      trim: true,
      index: true,
    },
    image: {
      type: String,
      required: [true, 'School branch photo is required'],
      trim: true,
    },
    primaryFormUrl: {
      type: String,
      required: [true, 'Primary Teacher application form URL is required'],
      trim: true,
    },
    secondaryFormUrl: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

schoolBranchSchema.index({ status: 1, district: 1 });

const SchoolBranch = mongoose.model('SchoolBranch', schoolBranchSchema);

export default SchoolBranch;
