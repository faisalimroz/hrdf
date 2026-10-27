import Child from '../models/Child.js';

/**
 * @route   GET /api/children
 * @desc    Fetch child profiles with filter support (gender, location, age, sponsoredStatus)
 * @access  Public
 */
export const getChildren = async (req, res, next) => {
  try {
    const { gender, location, ageGroup, sponsoredStatus, search } = req.query;

    const query = {};

    if (gender && gender !== 'all') {
      query.gender = gender.toLowerCase();
    }

    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    if (sponsoredStatus !== undefined && sponsoredStatus !== 'all') {
      query.sponsoredStatus = sponsoredStatus === 'true';
    }

    if (ageGroup && ageGroup !== 'all') {
      if (ageGroup === '5-8') {
        query.age = { $gte: 5, $lte: 8 };
      } else if (ageGroup === '9-12') {
        query.age = { $gte: 9, $lte: 12 };
      } else if (ageGroup === '13-16') {
        query.age = { $gte: 13, $lte: 16 };
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { story: { $regex: search, $options: 'i' } },
      ];
    }

    const children = await Child.find(query)
      .sort({ sponsoredStatus: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: children.length,
      children,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/children/:id
 * @desc    Fetch individual child profile
 * @access  Public
 */
export const getChildById = async (req, res, next) => {
  try {
    const child = await Child.findById(req.params.id).lean();
    if (!child) {
      return res.status(404).json({
        success: false,
        error: 'Child not found',
      });
    }

    res.status(200).json({
      success: true,
      child,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getChildren,
  getChildById,
};
