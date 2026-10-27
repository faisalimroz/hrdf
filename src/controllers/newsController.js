import News from '../models/News.js';

/**
 * @route   GET /api/news
 * @desc    Fetch published news articles with optional source filtering and search
 * @access  Public
 */
export const getNews = async (req, res, next) => {
  try {
    const { source, search, page = 1, limit = 9 } = req.query;

    const query = { status: 'published' };

    if (source && source !== 'all') {
      query.source = { $regex: new RegExp(`^${source}$`, 'i') };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [news, total] = await Promise.all([
      News.find(query).sort({ publishedDate: -1 }).skip(skip).limit(limitNum).lean(),
      News.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: news.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      news,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/news/:id
 * @desc    Fetch single news article by ID
 * @access  Public
 */
export const getNewsById = async (req, res, next) => {
  try {
    const newsItem = await News.findById(req.params.id).lean();

    if (!newsItem) {
      return res.status(404).json({
        success: false,
        error: 'News article not found',
      });
    }

    res.status(200).json({
      success: true,
      news: newsItem,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getNews,
  getNewsById,
};
