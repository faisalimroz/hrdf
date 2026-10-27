import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Report year is required'],
      index: true,
    },
    category: {
      type: String,
      enum: {
        values: [
          'Annual Audit',
          'Financial Statement',
          'Impact Assessment',
          'Governance Report',
        ],
        message: '{VALUE} is not a valid report category',
      },
      default: 'Annual Audit',
    },
    summary: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File download URL is required'],
    },
    fileSize: {
      type: String,
      default: '2.5 MB',
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ year: -1, category: 1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;
