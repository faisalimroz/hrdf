import Blog from '../models/Blog.js';
import Initiative from '../models/Initiative.js';
import Report from '../models/Report.js';
import Career from '../models/Career.js';

/**
 * @route   GET /api/blogs
 * @desc    Fetch published blogs and news articles with category filtering and pagination
 * @access  Public
 */
export const getBlogs = async (req, res, next) => {
  try {
    const { category, tag, search, page = 1, limit = 9 } = req.query;

    const query = { isPublished: true };

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (tag && tag !== 'all') {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [blogs, total] = await Promise.all([
      Blog.find(query).sort({ publishedAt: -1 }).skip(skip).limit(limitNum).lean(),
      Blog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      blogs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/blogs/:slug
 * @desc    Fetch individual blog post by slug
 * @access  Public
 */
export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Story or article not found',
      });
    }

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/initiatives
 * @desc    Fetch all active or delivered foundation projects/initiatives
 * @access  Public
 */
export const getInitiatives = async (req, res, next) => {
  try {
    const { category, status, featured } = req.query;

    const query = {};

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (featured !== undefined) {
      query.isFeatured = featured === 'true';
    }

    const initiatives = await Initiative.find(query)
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: initiatives.length,
      initiatives,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports
 * @desc    Fetch annual audit reports and transparency documentation
 * @access  Public
 */
export const getReports = async (req, res, next) => {
  try {
    const { year, category } = req.query;

    const query = {};

    if (year && year !== 'all') {
      query.year = parseInt(year, 10);
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const reports = await Report.find(query).sort({ year: -1, publishedAt: -1 }).lean();

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/careers
 * @desc    Fetch active job and teaching circulars
 * @access  Public
 */
export const getCareers = async (req, res, next) => {
  try {
    const { department, location } = req.query;

    const query = { status: 'active' };

    if (department && department !== 'all') {
      query.department = department;
    }

    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    const careers = await Career.find(query).sort({ deadline: 1 }).lean();

    res.status(200).json({
      success: true,
      count: careers.length,
      careers,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getBlogs,
  getBlogBySlug,
  getInitiatives,
  getReports,
  getCareers,
};
