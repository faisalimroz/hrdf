import User from '../models/User.js';
import Child from '../models/Child.js';
import SponsorshipHistory from '../models/SponsorshipHistory.js';
import Donation from '../models/Donation.js';
import Blog from '../models/Blog.js';
import News from '../models/News.js';
import Initiative from '../models/Initiative.js';
import Career from '../models/Career.js';
import CareerApplication from '../models/CareerApplication.js';
import SchoolBranch from '../models/SchoolBranch.js';
import SiteSetting from '../models/SiteSetting.js';

// ============================================================================
// 1. DASHBOARD ANALYTICS
// ============================================================================

/**
 * @route   GET /api/admin/analytics
 * @desc    Get executive metrics, aggregate funds raised, and child sponsorship counts
 * @access  Private/Admin
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalChildren,
      sponsoredChildren,
      waitingChildren,
      activeSponsorships,
      donationsAgg,
      recentDonations,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Child.countDocuments(),
      Child.countDocuments({ sponsoredStatus: true }),
      Child.countDocuments({ sponsoredStatus: false }),
      SponsorshipHistory.countDocuments({ status: 'active' }),
      Donation.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Donation.find().sort({ createdAt: -1 }).limit(6).lean(),
      User.find().select('-password').sort({ createdAt: -1 }).limit(6).lean(),
    ]);

    const totalRaised = donationsAgg[0]?.totalAmount || 0;
    const totalTransactions = donationsAgg[0]?.count || 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalChildren,
        sponsoredChildren,
        waitingChildren,
        activeSponsorships,
        totalRaised,
        totalTransactions,
      },
      recentDonations,
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 2. USER MANAGEMENT
// ============================================================================

/**
 * @route   GET /api/admin/users
 * @desc    List all registered users with pagination & search
 * @access  Private/Admin
 */
export const getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10, role, status } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') query.role = role;
    if (status && status !== 'all') query.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Toggle user status (active <-> inactive)
 * @access  Private/Admin
 */
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot deactivate your own administrative account.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User marked as ${user.status}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user account
 * @access  Private/Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own administrative account.',
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 3. CHILD ROSTER CMS
// ============================================================================

/**
 * @route   POST /api/admin/children
 * @desc    Add a new child to the sponsorship roster
 * @access  Private/Admin
 */
export const createChild = async (req, res, next) => {
  try {
    const { name, age, location, gender, story, imageUrl } = req.body;

    if (!name || !age || !location || !gender || !story || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required child fields: name, age, location, gender, story, imageUrl',
      });
    }

    const child = await Child.create({
      name: name.trim(),
      age: Number(age),
      location: location.trim(),
      gender: gender.toLowerCase(),
      story: story.trim(),
      imageUrl: imageUrl.trim(),
      sponsoredStatus: false,
    });

    res.status(201).json({
      success: true,
      message: 'Child profile added to sponsorship roster successfully',
      child,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/children/:id
 * @desc    Update child details
 * @access  Private/Admin
 */
export const updateChild = async (req, res, next) => {
  try {
    const child = await Child.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!child) {
      return res.status(404).json({ success: false, error: 'Child not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Child profile updated successfully',
      child,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/children/:id
 * @desc    Remove a child from the sponsorship roster
 * @access  Private/Admin
 */
export const deleteChild = async (req, res, next) => {
  try {
    const child = await Child.findByIdAndDelete(req.params.id);
    if (!child) {
      return res.status(404).json({ success: false, error: 'Child not found' });
    }

    // Also remove associated sponsorship history if any
    await SponsorshipHistory.deleteMany({ childId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Child removed from roster successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/children/:id/history
 * @desc    View complete sponsorship audit trail for a child
 * @access  Private/Admin
 */
export const getChildHistory = async (req, res, next) => {
  try {
    const [child, history] = await Promise.all([
      Child.findById(req.params.id).lean(),
      SponsorshipHistory.find({ childId: req.params.id })
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (!child) {
      return res.status(404).json({ success: false, error: 'Child not found' });
    }

    res.status(200).json({
      success: true,
      child,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 4. BLOGS & NEWS CMS
// ============================================================================

/**
 * @route   POST /api/admin/blogs
 * @desc    Create a new blog or news article
 * @access  Private/Admin
 */
export const createBlog = async (req, res, next) => {
  try {
    const { title, excerpt, content, coverImage, category, tags, isPublished } = req.body;

    if (!title || !content || !coverImage) {
      return res.status(400).json({
        success: false,
        error: 'Title, content, and cover image are required',
      });
    }

    const blog = await Blog.create({
      title: title.trim(),
      excerpt: excerpt?.trim() || title.trim(),
      content,
      coverImage: coverImage.trim(),
      category: category || 'Impact Stories',
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map((t) => t.trim()) : [],
      isPublished: isPublished !== undefined ? isPublished : true,
      author: {
        name: req.user.name,
        userId: req.user._id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Article published successfully',
      blog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/blogs/:id
 * @desc    Update a blog post
 * @access  Private/Admin
 */
export const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!blog) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      blog,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/blogs/:id
 * @desc    Delete a blog post
 * @access  Private/Admin
 */
export const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 4B. NEWS CMS
// ============================================================================

/**
 * @route   GET /api/admin/news
 * @desc    Fetch all news entries (including drafts) for CMS
 * @access  Private/Admin
 */
export const getAdminNews = async (req, res, next) => {
  try {
    const { search, source, status, page = 1, limit = 15 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
      ];
    }

    if (source && source !== 'all') query.source = source;
    if (status && status !== 'all') query.status = status;

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
 * @route   POST /api/admin/news
 * @desc    Create a news article
 * @access  Private/Admin
 */
export const createNews = async (req, res, next) => {
  try {
    const { title, externalUrl, source, image, publishedDate, summary, status } = req.body;

    if (!title || !externalUrl || !source || !image || !summary) {
      return res.status(400).json({
        success: false,
        error: 'Title, external URL, source, image, and summary are required',
      });
    }

    const news = await News.create({
      title: title.trim(),
      externalUrl: externalUrl.trim(),
      source: source.trim(),
      image: image.trim(),
      publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
      summary: summary.trim(),
      status: status || 'published',
    });

    res.status(201).json({
      success: true,
      message: 'News article added successfully',
      news,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/news/:id
 * @desc    Update a news article
 * @access  Private/Admin
 */
export const updateNews = async (req, res, next) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!news) {
      return res.status(404).json({ success: false, error: 'News article not found' });
    }

    res.status(200).json({
      success: true,
      message: 'News article updated successfully',
      news,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/news/:id
 * @desc    Delete a news article
 * @access  Private/Admin
 */
export const deleteNews = async (req, res, next) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, error: 'News article not found' });
    }

    res.status(200).json({
      success: true,
      message: 'News article deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 5. INITIATIVES CMS
// ============================================================================

/**
 * @route   POST /api/admin/initiatives
 * @desc    Create a new foundation initiative
 * @access  Private/Admin
 */
export const createInitiative = async (req, res, next) => {
  try {
    const {
      title,
      summary,
      description,
      category,
      bannerImage,
      targetAmount,
      raisedAmount,
      isFeatured,
      status,
      location,
      targetReach,
      updates,
    } = req.body;

    if (!title || !description || !bannerImage || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, category, and banner image are required',
      });
    }

    const initiative = await Initiative.create({
      title: title.trim(),
      summary: summary?.trim() || title.trim(),
      description,
      category,
      bannerImage: bannerImage.trim(),
      targetAmount: Number(targetAmount) || 0,
      raisedAmount: Number(raisedAmount) || 0,
      isFeatured: Boolean(isFeatured),
      status: status || 'active',
      location: location ? location.trim() : 'Nationwide, Bangladesh',
      targetReach: targetReach ? targetReach.trim() : '1,000+ Beneficiaries',
      updates: Array.isArray(updates) ? updates : [],
    });

    res.status(201).json({
      success: true,
      message: 'Initiative created successfully',
      initiative,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/initiatives/:id
 * @desc    Update an initiative
 * @access  Private/Admin
 */
export const updateInitiative = async (req, res, next) => {
  try {
    const initiative = await Initiative.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!initiative) {
      return res.status(404).json({ success: false, error: 'Initiative not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Initiative updated successfully',
      initiative,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/initiatives/:id
 * @desc    Delete an initiative
 * @access  Private/Admin
 */
export const deleteInitiative = async (req, res, next) => {
  try {
    const initiative = await Initiative.findByIdAndDelete(req.params.id);
    if (!initiative) {
      return res.status(404).json({ success: false, error: 'Initiative not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Initiative deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 6. SITE SETTINGS & DYNAMIC PRICING CONFIGURATION
// ============================================================================

/**
 * @route   GET /api/admin/settings
 * @desc    Fetch current site settings
 * @access  Private/Admin
 */
export const getAdminSettings = async (req, res, next) => {
  try {
    let settings = await SiteSetting.findOne();
    if (!settings) {
      settings = await SiteSetting.seedDefaultSettings();
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/settings
 * @desc    Update pricing configs dynamically
 * @access  Private/Admin
 */
export const updateAdminSettings = async (req, res, next) => {
  try {
    const {
      organizationName,
      sponsorshipMonthlyAmount,
      sponsorshipQuarterlyAmount,
      sponsorshipYearlyAmount,
      allowCustomDonations,
      minimumCustomDonation,
      currency,
    } = req.body;

    let settings = await SiteSetting.findOne();
    if (!settings) {
      settings = new SiteSetting();
    }

    if (organizationName) settings.organizationName = organizationName.trim();
    if (sponsorshipMonthlyAmount !== undefined)
      settings.sponsorshipMonthlyAmount = Number(sponsorshipMonthlyAmount);
    if (sponsorshipQuarterlyAmount !== undefined)
      settings.sponsorshipQuarterlyAmount = Number(sponsorshipQuarterlyAmount);
    if (sponsorshipYearlyAmount !== undefined)
      settings.sponsorshipYearlyAmount = Number(sponsorshipYearlyAmount);
    if (allowCustomDonations !== undefined)
      settings.allowCustomDonations = Boolean(allowCustomDonations);
    if (minimumCustomDonation !== undefined)
      settings.minimumCustomDonation = Number(minimumCustomDonation);
    if (currency) settings.currency = currency.toUpperCase().trim();

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Site settings and sponsorship pricing updated successfully',
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 7. DONATIONS & SPONSORSHIP AUDIT MANAGEMENT
// ============================================================================

/**
 * @route   GET /api/admin/donations
 * @desc    List all donations with pagination & filters
 * @access  Private/Admin
 */
export const getAdminDonations = async (req, res, next) => {
  try {
    const { search, status, gateway, page = 1, limit = 15 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { donorEmail: { $regex: search, $options: 'i' } },
        { donorName: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') query.status = status;
    if (gateway && gateway !== 'all') query.paymentGateway = gateway;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [donations, total] = await Promise.all([
      Donation.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Donation.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: donations.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 8. SCHOOL BRANCHES & TEACHER RECRUITMENT CMS
// ============================================================================

/**
 * @route   GET /api/admin/schools
 * @desc    Fetch all school branches
 * @access  Private/Admin
 */
export const getAdminSchools = async (req, res, next) => {
  try {
    const { search, district, status } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
      ];
    }
    if (district && district !== 'all') query.district = district;
    if (status && status !== 'all') query.status = status;

    const schools = await SchoolBranch.find(query).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      count: schools.length,
      schools,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/schools
 * @desc    Create school branch with Google Form links
 * @access  Private/Admin
 */
export const createSchool = async (req, res, next) => {
  try {
    const { name, location, district, image, primaryFormUrl, secondaryFormUrl, description, status } =
      req.body;

    if (!name || !location || !district || !image || !primaryFormUrl) {
      return res.status(400).json({
        success: false,
        error: 'School name, location, district, image, and Primary Form URL are required',
      });
    }

    const school = await SchoolBranch.create({
      name: name.trim(),
      location: location.trim(),
      district: district.trim(),
      image: image.trim(),
      primaryFormUrl: primaryFormUrl.trim(),
      secondaryFormUrl: secondaryFormUrl ? secondaryFormUrl.trim() : '',
      description: description ? description.trim() : '',
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'School branch created successfully',
      school,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/schools/:id
 * @desc    Update school branch details
 * @access  Private/Admin
 */
export const updateSchool = async (req, res, next) => {
  try {
    const school = await SchoolBranch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!school) {
      return res.status(404).json({ success: false, error: 'School branch not found' });
    }

    res.status(200).json({
      success: true,
      message: 'School branch updated successfully',
      school,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/schools/:id
 * @desc    Delete a school branch
 * @access  Private/Admin
 */
export const deleteSchool = async (req, res, next) => {
  try {
    const school = await SchoolBranch.findByIdAndDelete(req.params.id);
    if (!school) {
      return res.status(404).json({ success: false, error: 'School branch not found' });
    }

    res.status(200).json({
      success: true,
      message: 'School branch deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 9. CAREER CIRCULARS & CANDIDATE APPLICATIONS CMS
// ============================================================================

/**
 * @route   GET /api/admin/jobs
 * @desc    List all career vacancies with total candidate application counts
 * @access  Private/Admin
 */
export const getAdminJobs = async (req, res, next) => {
  try {
    const { search, department, status } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    if (department && department !== 'all') query.department = department;
    if (status && status !== 'all') query.status = status;

    const jobs = await Career.find(query).sort({ createdAt: -1 }).lean();

    const jobIds = jobs.map((j) => j._id);
    const appCounts = await CareerApplication.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    appCounts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const jobsWithCounts = jobs.map((j) => ({
      ...j,
      applicationsCount: countMap[j._id.toString()] || 0,
    }));

    res.status(200).json({
      success: true,
      count: jobsWithCounts.length,
      jobs: jobsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/jobs
 * @desc    Create a new career circular
 * @access  Private/Admin
 */
export const createJob = async (req, res, next) => {
  try {
    const {
      title,
      department,
      location,
      type,
      deadline,
      description,
      requirements,
      responsibilities,
      status,
    } = req.body;

    if (!title || !department || !location || !deadline || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title, department, location, deadline, and description are required',
      });
    }

    const job = await Career.create({
      title: title.trim(),
      department,
      location: location.trim(),
      type: type || 'Full-Time',
      deadline: new Date(deadline),
      description,
      requirements: Array.isArray(requirements)
        ? requirements
        : requirements
        ? requirements.split('\n').filter(Boolean)
        : [],
      responsibilities: Array.isArray(responsibilities)
        ? responsibilities
        : responsibilities
        ? responsibilities.split('\n').filter(Boolean)
        : [],
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Job circular created successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/jobs/:id
 * @desc    Update a career circular
 * @access  Private/Admin
 */
export const updateJob = async (req, res, next) => {
  try {
    const job = await Career.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job circular not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Job circular updated successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/admin/jobs/:id
 * @desc    Delete a career circular and associated applications
 * @access  Private/Admin
 */
export const deleteJob = async (req, res, next) => {
  try {
    const job = await Career.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job circular not found' });
    }

    await CareerApplication.deleteMany({ jobId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Job circular and candidate applications removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/jobs/:id/applications
 * @desc    View candidate applications submitted for a job opening
 * @access  Private/Admin
 */
export const getJobApplications = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, search } = req.query;

    const query = { jobId: id };
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [job, applications] = await Promise.all([
      Career.findById(id).lean(),
      CareerApplication.find(query).sort({ createdAt: -1 }).lean(),
    ]);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job circular not found' });
    }

    res.status(200).json({
      success: true,
      job,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/jobs/applications/:appId/status
 * @desc    Update candidate application review status
 * @access  Private/Admin
 */
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const { status, adminNotes } = req.body;

    const application = await CareerApplication.findById(appId);
    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    if (status) application.status = status;
    if (adminNotes !== undefined) application.adminNotes = adminNotes;

    await application.save();

    res.status(200).json({
      success: true,
      message: `Candidate application marked as ${status}`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAnalytics,
  getUsers,
  toggleUserStatus,
  deleteUser,
  createChild,
  updateChild,
  deleteChild,
  getChildHistory,
  createBlog,
  updateBlog,
  deleteBlog,
  getAdminNews,
  createNews,
  updateNews,
  deleteNews,
  createInitiative,
  updateInitiative,
  deleteInitiative,
  getAdminSettings,
  updateAdminSettings,
  getAdminDonations,
  getAdminSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  getAdminJobs,
  createJob,
  updateJob,
  deleteJob,
  getJobApplications,
  updateApplicationStatus,
};
