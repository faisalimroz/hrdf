import mongoose from 'mongoose';

const initiativeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Initiative title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      required: [true, 'Short summary is required'],
      maxlength: [350, 'Summary cannot exceed 350 characters'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Detailed project description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Education',
          'Child Welfare',
          'Disaster Relief',
          'Healthcare & Hygiene',
          'Youth Empowerment',
          'Women Development',
        ],
        message: '{VALUE} is not an authorized initiative category',
      },
      index: true,
    },
    bannerImage: {
      type: String,
      required: [true, 'Banner image URL is required'],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target funding goal is required'],
      min: [0, 'Target amount cannot be negative'],
      default: 0,
    },
    raisedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Raised amount cannot be negative'],
    },
    donorCount: {
      type: Number,
      default: 0,
      min: [0, 'Donor count cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'completed', 'upcoming'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
      index: true,
    },
    location: {
      type: String,
      default: 'Nationwide, Bangladesh',
      trim: true,
    },
    targetReach: {
      type: String,
      default: '1,000+ Students & Families',
      trim: true,
    },
    updates: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        snippet: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
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

// Virtual field for fundraising progress percentage
initiativeSchema.virtual('progressPercentage').get(function () {
  if (!this.targetAmount || this.targetAmount === 0) return 0;
  const percentage = (this.raisedAmount / this.targetAmount) * 100;
  return Math.min(Math.round(percentage * 10) / 10, 100);
});

// Slug auto-generation fallback helper
initiativeSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

const Initiative = mongoose.model('Initiative', initiativeSchema);

export default Initiative;
