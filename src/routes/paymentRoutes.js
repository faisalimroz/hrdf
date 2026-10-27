import express from 'express';
import {
  initiateSponsorship,
  initiateDonation,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  bkashCallback,
  simulateGatewayPage,
} from '../controllers/paymentController.js';

const router = express.Router();

// Initiate Transaction Endpoints
router.post('/initiate-sponsorship', initiateSponsorship);
router.post('/initiate-donation', initiateDonation);

// Gateway Callbacks (Accepts both POST and GET for SSLCommerz & bKash)
router.post('/success', paymentSuccess);
router.get('/success', paymentSuccess);

router.post('/fail', paymentFail);
router.get('/fail', paymentFail);

router.post('/cancel', paymentCancel);
router.get('/cancel', paymentCancel);

// bKash specific tokenized callback
router.get('/bkash-callback', bkashCallback);

// Sandbox / Development Simulator UI
router.get('/simulate-gateway', simulateGatewayPage);

export default router;
