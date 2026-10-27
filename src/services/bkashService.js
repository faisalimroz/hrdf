import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

let cachedBkashToken = null;
let tokenExpiresAt = null;

const getBkashConfig = () => {
  const appKey = process.env.BKASH_APP_KEY;
  const appSecret = process.env.BKASH_APP_SECRET;
  const username = process.env.BKASH_USERNAME;
  const password = process.env.BKASH_PASSWORD;
  const baseUrl = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';

  const isConfigured =
    appKey &&
    appSecret &&
    username &&
    password &&
    appKey !== 'your_bkash_app_key';

  return { appKey, appSecret, username, password, baseUrl, isConfigured };
};

/**
 * Grant or Refresh bKash Authorization Token
 */
export const grantBkashToken = async () => {
  const { appKey, appSecret, username, password, baseUrl, isConfigured } = getBkashConfig();

  if (!isConfigured) {
    return 'simulated_bkash_token_2026';
  }

  // Return cached token if still valid
  if (cachedBkashToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedBkashToken;
  }

  try {
    const response = await axios.post(
      `${baseUrl}/tokenized/checkout/token/grant`,
      {
        app_key: appKey,
        app_secret: appSecret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          username,
          password,
        },
        timeout: 10000,
      }
    );

    if (response.data?.id_token) {
      cachedBkashToken = response.data.id_token;
      // Expires in response.data.expires_in seconds (default ~3600), buffer by 5 minutes
      const expiresIn = (response.data.expires_in || 3600) - 300;
      tokenExpiresAt = Date.now() + expiresIn * 1000;
      return cachedBkashToken;
    } else {
      throw new Error(response.data?.statusMessage || 'Failed to obtain bKash token');
    }
  } catch (error) {
    console.error('[bKash Token Grant Error]:', error.message);
    throw error;
  }
};

/**
 * Create bKash Payment Session
 */
export const createBkashPayment = async ({
  amount,
  tranId,
  payerReference = '01700000000',
}) => {
  const { appKey, baseUrl, isConfigured } = getBkashConfig();
  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
  const callbackUrl = `${serverUrl}/api/payments/bkash-callback?tranId=${tranId}`;

  // If mock or unconfigured in development, use simulation gateway
  if (!isConfigured) {
    console.log(`[bKash] Running in mock/simulation mode for TranID: ${tranId}`);
    return {
      success: true,
      redirectUrl: `${serverUrl}/api/payments/simulate-gateway?gateway=bkash&tranId=${tranId}&amount=${amount}`,
      paymentId: `mock_bkash_${tranId}`,
      isSimulated: true,
    };
  }

  try {
    const idToken = await grantBkashToken();

    const response = await axios.post(
      `${baseUrl}/tokenized/checkout/create`,
      {
        mode: '0011',
        payerReference,
        callbackURL: callbackUrl,
        amount: amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: tranId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: idToken,
          'X-APP-Key': appKey,
        },
        timeout: 15000,
      }
    );

    if (response.data?.statusCode === '0000' && response.data?.bkashURL) {
      return {
        success: true,
        redirectUrl: response.data.bkashURL,
        paymentId: response.data.paymentID,
        isSimulated: false,
      };
    } else {
      throw new Error(response.data?.statusMessage || 'bKash payment initiation failed');
    }
  } catch (error) {
    console.error('[bKash Create Payment Error]:', error.message);

    // Development fallback
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[bKash] Fallback to simulated payment gateway for local development.');
      return {
        success: true,
        redirectUrl: `${serverUrl}/api/payments/simulate-gateway?gateway=bkash&tranId=${tranId}&amount=${amount}`,
        paymentId: `fallback_bkash_${tranId}`,
        isSimulated: true,
      };
    }

    throw error;
  }
};

/**
 * Execute bKash Payment after callback
 */
export const executeBkashPayment = async (paymentId) => {
  const { appKey, baseUrl, isConfigured } = getBkashConfig();

  if (!isConfigured || paymentId?.startsWith('mock_') || paymentId?.startsWith('fallback_')) {
    return {
      statusCode: '0000',
      statusMessage: 'Successful',
      paymentID: paymentId,
      trxID: `TRX_${Date.now()}`,
      amount: '0',
      simulated: true,
    };
  }

  try {
    const idToken = await grantBkashToken();

    const response = await axios.post(
      `${baseUrl}/tokenized/checkout/execute`,
      { paymentID: paymentId },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: idToken,
          'X-APP-Key': appKey,
        },
        timeout: 15000,
      }
    );

    return response.data;
  } catch (error) {
    console.error('[bKash Execute Payment Error]:', error.message);
    throw error;
  }
};

/**
 * Query bKash Payment Status
 */
export const queryBkashPayment = async (paymentId) => {
  const { appKey, baseUrl, isConfigured } = getBkashConfig();

  if (!isConfigured || paymentId?.startsWith('mock_') || paymentId?.startsWith('fallback_')) {
    return {
      statusCode: '0000',
      statusMessage: 'Successful',
      paymentID: paymentId,
      transactionStatus: 'Completed',
    };
  }

  try {
    const idToken = await grantBkashToken();

    const response = await axios.post(
      `${baseUrl}/tokenized/checkout/payment/search`,
      { paymentID: paymentId },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: idToken,
          'X-APP-Key': appKey,
        },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error) {
    console.error('[bKash Query Payment Error]:', error.message);
    throw error;
  }
};

export default {
  grantBkashToken,
  createBkashPayment,
  executeBkashPayment,
  queryBkashPayment,
};
