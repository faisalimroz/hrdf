import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const getStoreConfig = () => {
  const storeId = process.env.SSL_STORE_ID || process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSL_STORE_PASSWORD || process.env.SSLCOMMERZ_STORE_PASSWORD;
  const isLive = process.env.SSL_IS_LIVE === 'true' || process.env.SSLCOMMERZ_IS_LIVE === 'true';

  const baseUrl = isLive
    ? 'https://securepay.sslcommerz.com'
    : 'https://sandbox.sslcommerz.com';

  return { storeId, storePassword, isLive, baseUrl };
};

/**
 * Initialize SSLCommerz Payment Session
 */
export const initSSLCommerzPayment = async ({
  totalAmount,
  tranId,
  customerName,
  customerEmail,
  customerPhone = '01700000000',
  productName = 'Hdfd Foundation Giving',
  productCategory = 'Donation',
  customValues = {},
}) => {
  const { storeId, storePassword, isLive, baseUrl } = getStoreConfig();
  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';

  const successUrl = `${serverUrl}/api/payments/success?gateway=sslcommerz`;
  const failUrl = `${serverUrl}/api/payments/fail?gateway=sslcommerz`;
  const cancelUrl = `${serverUrl}/api/payments/cancel?gateway=sslcommerz`;
  const ipnUrl = `${serverUrl}/api/payments/ipn`;

  // If credentials are dummy/placeholder or unset in dev, return simulated gateway redirect
  if (!storeId || storeId === 'your_store_id' || !storePassword) {
    console.log(`[SSLCommerz] Running in mock/simulation mode for TranID: ${tranId}`);
    return {
      success: true,
      redirectUrl: `${serverUrl}/api/payments/simulate-gateway?gateway=sslcommerz&tranId=${tranId}&amount=${totalAmount}`,
      sessionKey: `mock_session_${tranId}`,
      isSimulated: true,
    };
  }

  const payload = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: totalAmount.toString(),
    currency: 'BDT',
    tran_id: tranId,
    success_url: successUrl,
    fail_url: failUrl,
    cancel_url: cancelUrl,
    ipn_url: ipnUrl,
    shipping_method: 'NO',
    product_name: productName,
    product_category: productCategory,
    product_profile: 'non-physical-goods',
    cus_name: customerName || 'Hdfd Supporter',
    cus_email: customerEmail || 'donor@hdfd-foundation.org',
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    cus_phone: customerPhone,
    value_a: customValues.paymentType || 'donation', // 'sponsorship' or 'donation'
    value_b: customValues.childId || customValues.causeCategory || '',
    value_c: customValues.userId || customValues.donorEmail || '',
    value_d: customValues.billingCycle || customValues.frequency || '',
  });

  try {
    const response = await axios.post(
      `${baseUrl}/gwprocess/v4/api.php`,
      payload.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 15000,
      }
    );

    if (response.data?.status === 'SUCCESS' && response.data?.GatewayPageURL) {
      return {
        success: true,
        redirectUrl: response.data.GatewayPageURL,
        sessionKey: response.data.sessionkey,
        isSimulated: false,
      };
    } else {
      throw new Error(response.data?.failedreason || 'Failed to initiate SSLCommerz payment');
    }
  } catch (error) {
    console.error('[SSLCommerz Error]:', error.message);

    // Graceful fallback to sandbox simulation in development if live/sandbox endpoint is unreachable
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[SSLCommerz] Fallback to simulated gateway session for local development.');
      return {
        success: true,
        redirectUrl: `${serverUrl}/api/payments/simulate-gateway?gateway=sslcommerz&tranId=${tranId}&amount=${totalAmount}`,
        sessionKey: `fallback_session_${tranId}`,
        isSimulated: true,
      };
    }

    throw error;
  }
};

/**
 * Validate SSLCommerz Transaction (using val_id)
 */
export const validateSSLCommerzPayment = async (valId) => {
  const { storeId, storePassword, baseUrl } = getStoreConfig();

  if (!storeId || storeId === 'your_store_id' || valId?.startsWith('sim_')) {
    return {
      status: 'VALID',
      val_id: valId,
      amount: '0',
      validated: true,
      simulated: true,
    };
  }

  try {
    const url = `${baseUrl}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePassword}&format=json`;
    const response = await axios.get(url, { timeout: 10000 });
    return response.data;
  } catch (error) {
    console.error('[SSLCommerz Validation Error]:', error.message);
    throw error;
  }
};

export default {
  initSSLCommerzPayment,
  validateSSLCommerzPayment,
};
