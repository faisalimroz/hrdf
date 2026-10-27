import User from '../models/User.js';
import SponsorshipHistory from '../models/SponsorshipHistory.js';
import Donation from '../models/Donation.js';

/**
 * @route   GET /api/portal/dashboard
 * @desc    Fetch authenticated user's sponsorship portfolio, donation records, and giving metrics
 * @access  Private (verifyToken)
 */
export const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email.toLowerCase().trim();

    // 1. Fetch user sponsorships (both by ObjectId and by email)
    const sponsorships = await SponsorshipHistory.find({
      $or: [{ userId }, { donorEmail: userEmail }],
    })
      .populate('childId')
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch user donation / transaction records
    const donations = await Donation.find({
      $or: [{ userId }, { donorEmail: userEmail }],
    })
      .sort({ createdAt: -1 })
      .lean();

    // 3. Compute metrics
    const activeSponsorships = sponsorships.filter((s) => s.status === 'active');
    const successfulDonations = donations.filter((d) => d.status === 'success');

    const totalContributed = successfulDonations.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // Dynamic recurring monthly calculation: 2,500 BDT per active child
    const monthlyCommitment = activeSponsorships.length * 2500;

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '',
        profilePhoto: req.user.profilePhoto || '',
        preferredCurrency: req.user.preferredCurrency || 'BDT',
        role: req.user.role,
      },
      metrics: {
        totalContributed,
        activeSponsorshipCount: activeSponsorships.length,
        totalDonationsCount: successfulDonations.length,
        totalTransactionsCount: donations.length,
        monthlyCommitment,
      },
      sponsorships,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/portal/profile
 * @desc    Update user personal info & settings
 * @access  Private (verifyToken)
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, preferredCurrency, profilePhoto } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (preferredCurrency) user.preferredCurrency = preferredCurrency.toUpperCase().trim();
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        preferredCurrency: user.preferredCurrency,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardData,
  updateProfile,
};
