import Child from '../models/Child.js';
import Donation from '../models/Donation.js';
import SponsorshipHistory from '../models/SponsorshipHistory.js';
import SiteSetting from '../models/SiteSetting.js';
import { initSSLCommerzPayment, validateSSLCommerzPayment } from '../services/sslcommerzService.js';
import { createBkashPayment, executeBkashPayment } from '../services/bkashService.js';

/**
 * Helper to finalize successful payments for both sponsorships and donations
 */
const handlePaymentSuccess = async (tranId, gatewayResponse = {}) => {
  const donation = await Donation.findOne({ transactionId: tranId });
  if (!donation) {
    console.error(`[PaymentSuccess] Record not found for tranId: ${tranId}`);
    return null;
  }

  // If already processed, return existing
  if (donation.status === 'success') {
    return donation;
  }

  donation.status = 'success';
  donation.paidAt = new Date();
  donation.gatewayResponse = {
    ...donation.gatewayResponse,
    ...gatewayResponse,
    processedAt: new Date(),
  };
  await donation.save();

  // Check if this was a sponsorship payment
  const isSponsorship =
    donation.causeCategory === 'Child Sponsorship' ||
    donation.gatewayResponse?.type === 'sponsorship';

  if (isSponsorship && donation.gatewayResponse?.childId) {
    const childId = donation.gatewayResponse.childId;
    const child = await Child.findById(childId);

    if (child) {
      child.sponsoredStatus = true;
      child.currentSponsorId = donation.userId || null;
      child.currentDonorEmail = donation.donorEmail;
      await child.save();

      // Create new audit record in SponsorshipHistory collection
      await SponsorshipHistory.create({
        childId: child._id,
        userId: donation.userId || null,
        donorEmail: donation.donorEmail,
        donorName: donation.donorName,
        startDate: new Date(),
        status: 'active',
        totalContribution: donation.amount,
      });

      console.log(`[Sponsorship] Successfully sponsored child: ${child.name} by ${donation.donorEmail}`);
    }
  }

  return donation;
};

/**
 * @route   GET /api/settings
 * @desc    Public endpoint to fetch active pricing configurations & dynamic settings
 * @access  Public
 */
export const getSettings = async (req, res, next) => {
  try {
    let settings = await SiteSetting.findOne();
    if (!settings) {
      settings = await SiteSetting.seedDefaultSettings();
    }

    res.status(200).json({
      success: true,
      settings: {
        organizationName: settings.organizationName,
        sponsorshipMonthlyAmount: settings.sponsorshipMonthlyAmount,
        sponsorshipQuarterlyAmount: settings.sponsorshipQuarterlyAmount,
        sponsorshipYearlyAmount: settings.sponsorshipYearlyAmount,
        allowCustomDonations: settings.allowCustomDonations,
        currency: settings.currency || 'BDT',
        minimumCustomDonation: settings.minimumCustomDonation || 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/payments/initiate-sponsorship
 * @desc    Initiate sponsorship payment for a designated child
 * @access  Public (or Authenticated)
 */
export const initiateSponsorship = async (req, res, next) => {
  try {
    const {
      childId,
      billingCycle = 'monthly',
      gateway = 'sslcommerz',
      donorName,
      donorEmail,
      donorPhone = '01700000000',
    } = req.body;

    if (!childId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid childId',
      });
    }

    // Determine donor identity
    const effectiveDonorEmail = req.user?.email || donorEmail;
    const effectiveDonorName = req.user?.name || donorName;
    const effectiveUserId = req.user?._id || null;

    if (!effectiveDonorEmail || !effectiveDonorName) {
      return res.status(400).json({
        success: false,
        error: 'Donor name and email are required to initiate sponsorship',
      });
    }

    // Find and validate child
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        error: 'Child not found',
      });
    }

    if (child.sponsoredStatus) {
      return res.status(400).json({
        success: false,
        error: `${child.name} has already been sponsored. Please choose another child.`,
      });
    }

    // Fetch dynamic pricing
    let settings = await SiteSetting.findOne();
    if (!settings) {
      settings = await SiteSetting.seedDefaultSettings();
    }

    let amount = settings.sponsorshipMonthlyAmount;
    if (billingCycle === 'quarterly') {
      amount = settings.sponsorshipQuarterlyAmount;
    } else if (billingCycle === 'yearly') {
      amount = settings.sponsorshipYearlyAmount;
    }

    // Generate unique transaction identifier
    const tranId = `HDFD-SPON-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Create pending donation/transaction entry
    await Donation.create({
      donorName: effectiveDonorName,
      donorEmail: effectiveDonorEmail.toLowerCase().trim(),
      userId: effectiveUserId,
      amount,
      currency: settings.currency || 'BDT',
      frequency: billingCycle === 'monthly' ? 'monthly' : 'one-time',
      causeCategory: 'Child Sponsorship',
      paymentGateway: gateway,
      transactionId: tranId,
      status: 'pending',
      gatewayResponse: {
        type: 'sponsorship',
        childId: child._id,
        childName: child.name,
        billingCycle,
      },
    });

    // Dispatch to payment gateway
    let paymentResult;
    if (gateway === 'bkash') {
      paymentResult = await createBkashPayment({
        amount,
        tranId,
        payerReference: donorPhone,
      });
    } else {
      // Default to SSLCommerz
      paymentResult = await initSSLCommerzPayment({
        totalAmount: amount,
        tranId,
        customerName: effectiveDonorName,
        customerEmail: effectiveDonorEmail,
        customerPhone: donorPhone,
        productName: `Child Sponsorship - ${child.name} (${billingCycle})`,
        productCategory: 'Child Sponsorship',
        customValues: {
          paymentType: 'sponsorship',
          childId: child._id.toString(),
          billingCycle,
          donorEmail: effectiveDonorEmail,
          userId: effectiveUserId ? effectiveUserId.toString() : '',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sponsorship payment initiated',
      redirectUrl: paymentResult.redirectUrl,
      transactionId: tranId,
      amount,
      currency: settings.currency || 'BDT',
      billingCycle,
      child: {
        id: child._id,
        name: child.name,
        location: child.location,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/payments/initiate-donation
 * @desc    Initiate donation for specific or general cause
 * @access  Public (or Authenticated)
 */
export const initiateDonation = async (req, res, next) => {
  try {
    const {
      amount,
      frequency = 'one-time',
      causeCategory = 'General Fund',
      gateway = 'sslcommerz',
      donorName,
      donorEmail,
      donorPhone = '01700000000',
    } = req.body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid donation amount (minimum ৳10)',
      });
    }

    const effectiveDonorEmail = req.user?.email || donorEmail;
    const effectiveDonorName = req.user?.name || donorName;
    const effectiveUserId = req.user?._id || null;

    if (!effectiveDonorEmail || !effectiveDonorName) {
      return res.status(400).json({
        success: false,
        error: 'Donor name and email are required to initiate a donation',
      });
    }

    const tranId = `HDFD-DON-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Save pending donation record
    await Donation.create({
      donorName: effectiveDonorName,
      donorEmail: effectiveDonorEmail.toLowerCase().trim(),
      userId: effectiveUserId,
      amount: parsedAmount,
      currency: 'BDT',
      frequency: frequency === 'monthly' ? 'monthly' : 'one-time',
      causeCategory,
      paymentGateway: gateway,
      transactionId: tranId,
      status: 'pending',
      gatewayResponse: {
        type: 'donation',
        causeCategory,
      },
    });

    let paymentResult;
    if (gateway === 'bkash') {
      paymentResult = await createBkashPayment({
        amount: parsedAmount,
        tranId,
        payerReference: donorPhone,
      });
    } else {
      paymentResult = await initSSLCommerzPayment({
        totalAmount: parsedAmount,
        tranId,
        customerName: effectiveDonorName,
        customerEmail: effectiveDonorEmail,
        customerPhone: donorPhone,
        productName: `Donation - ${causeCategory}`,
        productCategory: causeCategory,
        customValues: {
          paymentType: 'donation',
          causeCategory,
          frequency,
          donorEmail: effectiveDonorEmail,
          userId: effectiveUserId ? effectiveUserId.toString() : '',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Donation payment initiated',
      redirectUrl: paymentResult.redirectUrl,
      transactionId: tranId,
      amount: parsedAmount,
      currency: 'BDT',
      causeCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Gateway Success Callback (SSLCommerz POST / bKash GET)
 */
export const paymentSuccess = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const tranId = req.body?.tran_id || req.query?.tranId || req.query?.merchantInvoiceNumber;
  const valId = req.body?.val_id;

  try {
    if (!tranId) {
      return res.redirect(`${clientUrl}/payment/fail?reason=Missing+Transaction+ID`);
    }

    let validationResult = {};
    if (valId) {
      try {
        validationResult = await validateSSLCommerzPayment(valId);
      } catch (valErr) {
        console.warn('[PaymentSuccess] Validation call notice:', valErr.message);
      }
    }

    const donation = await handlePaymentSuccess(tranId, {
      ...req.body,
      ...req.query,
      validation: validationResult,
    });

    if (!donation) {
      return res.redirect(`${clientUrl}/payment/fail?tranId=${tranId}&reason=Transaction+Record+Not+Found`);
    }

    const type = donation.causeCategory === 'Child Sponsorship' ? 'sponsorship' : 'donation';
    return res.redirect(
      `${clientUrl}/payment/success?tranId=${tranId}&amount=${donation.amount}&type=${type}&gateway=${donation.paymentGateway}`
    );
  } catch (error) {
    console.error('[PaymentSuccess Fatal Error]:', error);
    return res.redirect(`${clientUrl}/payment/fail?tranId=${tranId || 'unknown'}&reason=${encodeURIComponent(error.message)}`);
  }
};

/**
 * Handle Gateway Failure Callback
 */
export const paymentFail = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const tranId = req.body?.tran_id || req.query?.tranId;
  const reason = req.body?.error || req.query?.reason || 'Payment was declined by gateway';

  if (tranId) {
    await Donation.findOneAndUpdate(
      { transactionId: tranId },
      { status: 'failed', gatewayResponse: { ...req.body, ...req.query, failedAt: new Date() } }
    );
  }

  return res.redirect(`${clientUrl}/payment/fail?tranId=${tranId || ''}&reason=${encodeURIComponent(reason)}`);
};

/**
 * Handle Gateway Cancel Callback
 */
export const paymentCancel = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const tranId = req.body?.tran_id || req.query?.tranId;

  if (tranId) {
    await Donation.findOneAndUpdate(
      { transactionId: tranId },
      { status: 'failed', gatewayResponse: { cancelled: true, cancelledAt: new Date() } }
    );
  }

  return res.redirect(`${clientUrl}/payment/fail?tranId=${tranId || ''}&reason=Payment+was+cancelled+by+user`);
};

/**
 * Handle bKash Callback Endpoint
 */
export const bkashCallback = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const { paymentID, status, tranId } = req.query;

  if (status === 'cancel') {
    return res.redirect(`${clientUrl}/payment/fail?tranId=${tranId || ''}&reason=Payment+Cancelled`);
  }

  if (status === 'failure') {
    return res.redirect(`${clientUrl}/payment/fail?tranId=${tranId || ''}&reason=bKash+Payment+Failed`);
  }

  if (status === 'success' || !status) {
    try {
      const executeResult = await executeBkashPayment(paymentID);
      if (executeResult.statusCode === '0000') {
        const donation = await handlePaymentSuccess(tranId, executeResult);
        const type = donation?.causeCategory === 'Child Sponsorship' ? 'sponsorship' : 'donation';
        return res.redirect(
          `${clientUrl}/payment/success?tranId=${tranId}&amount=${donation?.amount || ''}&type=${type}&gateway=bkash`
        );
      } else {
        return res.redirect(
          `${clientUrl}/payment/fail?tranId=${tranId || ''}&reason=${encodeURIComponent(executeResult.statusMessage || 'Execution failed')}`
        );
      }
    } catch (err) {
      console.error('[bKash Callback Error]:', err);
      return res.redirect(`${clientUrl}/payment/fail?tranId=${tranId || ''}&reason=bKash+Execution+Error`);
    }
  }

  return res.redirect(`${clientUrl}/payment/fail?tranId=${tranId || ''}&reason=Unknown+bKash+Status`);
};

/**
 * Dev Gateway Simulation Page
 */
export const simulateGatewayPage = (req, res) => {
  const { gateway, tranId, amount } = req.query;
  const isBkash = gateway === 'bkash';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${isBkash ? 'bKash' : 'SSLCommerz'} Sandbox Payment Simulator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fffcf5; color: #1e293b; margin: 0; padding: 20px; display: flex; align-items: center; justify-content: center; min-height: 90vh; }
          .card { background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); max-width: 440px; width: 100%; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: ${isBkash ? '#e2136e' : '#0f172a'}; color: white; padding: 24px; text-align: center; }
          .header h2 { margin: 0; font-size: 20px; font-weight: bold; }
          .badge { display: inline-block; background: rgba(255,255,255,0.2); font-size: 11px; padding: 4px 10px; border-radius: 20px; margin-top: 6px; text-transform: uppercase; font-weight: 600; }
          .content { padding: 24px; }
          .amount-box { text-align: center; margin-bottom: 24px; padding: 16px; background: #fbf9f4; border-radius: 12px; border: 1px dashed #cbd5e1; }
          .amount-box span { font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; }
          .amount-box h1 { margin: 4px 0 0 0; color: #0f172a; font-size: 32px; font-weight: 900; }
          .info-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 10px; color: #475569; }
          .btn-success { display: block; width: 100%; padding: 14px; background: #fbc116; color: #0f172a; font-weight: 800; font-size: 15px; border: none; border-radius: 10px; cursor: pointer; text-align: center; text-decoration: none; box-sizing: border-box; margin-bottom: 12px; transition: background 0.2s; }
          .btn-success:hover { background: #e5ab0a; }
          .btn-fail { display: block; width: 100%; padding: 12px; background: #fee2e2; color: #991b1b; font-weight: 700; font-size: 14px; border: 1px solid #fecaca; border-radius: 10px; cursor: pointer; text-align: center; text-decoration: none; box-sizing: border-box; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2>${isBkash ? 'bKash Tokenized Checkout' : 'SSLCommerz Payment Gateway'}</h2>
            <div class="badge">Sandbox / Development Simulator</div>
          </div>
          <div class="content">
            <div class="amount-box">
              <span>Payable Amount</span>
              <h1>৳ ${amount || '0'}</h1>
            </div>
            <div class="info-row">
              <span>Merchant:</span>
              <strong>Hdfd Foundation</strong>
            </div>
            <div class="info-row">
              <span>Invoice / Tran ID:</span>
              <strong style="font-family: monospace;">${tranId || 'N/A'}</strong>
            </div>
            <div class="info-row" style="margin-bottom: 24px;">
              <span>Environment:</span>
              <strong style="color: #059669;">Ready for Simulation</strong>
            </div>

            <form action="/api/payments/success" method="POST">
              <input type="hidden" name="tran_id" value="${tranId}">
              <input type="hidden" name="val_id" value="sim_${Date.now()}">
              <input type="hidden" name="gateway" value="${gateway}">
              <button type="submit" class="btn-success">Simulate Payment Success (Demo)</button>
            </form>

            <form action="/api/payments/fail" method="POST">
              <input type="hidden" name="tran_id" value="${tranId}">
              <input type="hidden" name="error" value="Transaction cancelled in sandbox simulation">
              <button type="submit" class="btn-fail">Simulate Payment Failure</button>
            </form>
          </div>
        </div>
      </body>
    </html>
  `;

  res.send(html);
};

export default {
  getSettings,
  initiateSponsorship,
  initiateDonation,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  bkashCallback,
  simulateGatewayPage,
};
