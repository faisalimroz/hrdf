import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog post title is required'],
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
    excerpt: {
      type: String,
      required: [true, 'Summary / excerpt is required'],
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Blog body content is required'],
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image URL is required'],
      trim: true,
    },
    image: {
      type: String,
      trim: true,
      default: function () {
        return this.coverImage;
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
      // Examples: 'Impact Stories', 'Education Updates', 'Events', 'Press Release'
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      name: {
        type: String,
        default: 'Hdfd Foundation Team',
      },
      avatar: {
        type: String,
        default: '',
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Slug auto-generation fallback helper
blogSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

blogSchema.index({ isPublished: 1, publishedAt: -1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
