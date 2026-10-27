import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'News headline/title is required'],
      trim: true,
      maxlength: [250, 'Title cannot exceed 250 characters'],
    },
    externalUrl: {
      type: String,
      required: [true, 'External news source URL is required'],
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
        'Please provide a valid external URL',
      ],
    },
    source: {
      type: String,
      required: [true, 'News publication source is required (e.g., The Daily Star, Prothom Alo)'],
      trim: true,
      index: true,
    },
    image: {
      type: String,
      required: [true, 'News feature image is required'],
      trim: true,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    summary: {
      type: String,
      required: [true, 'News excerpt or summary is required'],
      maxlength: [500, 'Summary cannot exceed 500 characters'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['published', 'draft'],
        message: '{VALUE} is not a valid news status',
      },
      default: 'published',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

newsSchema.index({ status: 1, publishedDate: -1 });

const News = mongoose.model('News', newsSchema);

export default News;
