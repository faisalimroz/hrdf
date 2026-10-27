import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not a supported role',
      },
      default: 'user',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
    preferredCurrency: {
      type: String,
      default: 'BDT',
      trim: true,
      uppercase: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: '',
      trim: true,
    },
    magicToken: {
      type: String,
      default: null,
      select: false,
    },
    magicTokenExpires: {
      type: Date,
      default: null,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate signed JWT Token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
      name: this.name,
    },
    process.env.JWT_SECRET || 'hdfd_secret_fallback_key',
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// Generate and hash magic link token (expires in 20 minutes)
userSchema.methods.generateMagicToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  // Hash token before storing in database
  this.magicToken = crypto.createHash('sha256').update(token).digest('hex');
  this.magicTokenExpires = new Date(Date.now() + 20 * 60 * 1000);

  return token;
};

// Generate and hash password reset token (expires in 30 minutes)
userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token before storing in database
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);

  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
