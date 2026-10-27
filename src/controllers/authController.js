import crypto from 'crypto';
import User from '../models/User.js';
import {
  sendMagicLinkEmail,
  sendPasswordResetEmail,
} from '../services/emailService.js';

/**
 * Helper to construct sanitized user payload
 */
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  profilePhoto: user.profilePhoto || '',
  role: user.role,
  status: user.status,
  preferredCurrency: user.preferredCurrency,
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with name, email, and password
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'user',
      status: 'active',
      preferredCurrency: 'BDT',
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Standard login with email and password
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. User not found.',
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        error: 'Your account is deactivated. Please contact support.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/magic-link
 * @desc    Generate and send magic link to user email
 * @access  Public
 */
export const sendMagicLink = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email address',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    // Auto-provision user if they do not yet exist
    if (!user) {
      const generatedName = normalizedEmail.split('@')[0].replace(/[._-]/g, ' ');
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        name: generatedName.charAt(0).toUpperCase() + generatedName.slice(1),
        email: normalizedEmail,
        password: randomPassword,
        role: 'user',
        status: 'active',
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        error: 'Your account is deactivated. Please contact support.',
      });
    }

    // Generate secure 32-byte token and set expiration
    const plainToken = user.generateMagicToken();
    await user.save({ validateBeforeSave: false });

    // Send email
    await sendMagicLinkEmail(user.email, plainToken);

    res.status(200).json({
      success: true,
      message: 'A secure magic login link has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/verify-magic-link
 * @desc    Validate magic link token and log user in
 * @access  Public
 */
export const verifyMagicLink = async (req, res, next) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required token or email parameters',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      magicToken: hashedToken,
      magicTokenExpires: { $gt: Date.now() },
    }).select('+magicToken +magicTokenExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Magic login link is invalid or has expired. Please request a new one.',
      });
    }

    // Clear tokens upon successful login
    user.magicToken = null;
    user.magicTokenExpires = null;
    await user.save({ validateBeforeSave: false });

    const jwtToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Magic link verified successfully',
      token: jwtToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password recovery email
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your registered email',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // For privacy, we don't disclose whether the user exists or not
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been dispatched.',
      });
    }

    const resetToken = user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailErr) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        error: 'Email could not be sent. Please try again later.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been dispatched.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide token, email, and your new password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Password reset link is invalid or has expired',
      });
    }

    // Set new password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    const jwtToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
      token: jwtToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/update-password
 * @desc    Update password for authenticated user
 * @access  Private (verifyToken)
 */
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password does not match',
      });
    }

    user.password = newPassword;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user details
 * @access  Private (verifyToken)
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  sendMagicLink,
  verifyMagicLink,
  forgotPassword,
  resetPassword,
  updatePassword,
  getMe,
};
