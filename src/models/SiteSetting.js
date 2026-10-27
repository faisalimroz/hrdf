import mongoose from 'mongoose';

const siteSettingSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      default: 'Human Development Forum Bangladesh (Hdfd Foundation)',
      trim: true,
    },
    sponsorshipMonthlyAmount: {
      type: Number,
      required: true,
      default: 2500, // In BDT
      min: [100, 'Monthly amount must be at least 100'],
    },
    sponsorshipQuarterlyAmount: {
      type: Number,
      required: true,
      default: 7500, // In BDT
      min: [300, 'Quarterly amount must be at least 300'],
    },
    sponsorshipYearlyAmount: {
      type: Number,
      required: true,
      default: 30000, // In BDT
      min: [1200, 'Yearly amount must be at least 1200'],
    },
    allowCustomDonations: {
      type: Boolean,
      default: true,
    },
    currency: {
      type: String,
      default: 'BDT',
      uppercase: true,
    },
    minimumCustomDonation: {
      type: Number,
      default: 100,
      min: 10,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Static method to ensure singleton default site settings exist
 */
siteSettingSchema.statics.seedDefaultSettings = async function () {
  const existing = await this.findOne();
  if (!existing) {
    const defaultSettings = await this.create({
      organizationName: 'Human Development Forum Bangladesh (Hdfd Foundation)',
      sponsorshipMonthlyAmount: 2500,
      sponsorshipQuarterlyAmount: 7500,
      sponsorshipYearlyAmount: 30000,
      allowCustomDonations: true,
      currency: 'BDT',
      minimumCustomDonation: 100,
    });
    console.log('[SiteSetting] Default dynamic pricing and settings successfully seeded.');
    return defaultSettings;
  }
  return existing;
};

const SiteSetting = mongoose.model('SiteSetting', siteSettingSchema);

export default SiteSetting;
