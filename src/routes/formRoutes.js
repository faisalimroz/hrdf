import express from 'express';
import {
  submitVolunteer,
  submitPartner,
  submitTeacher,
  submitInternship,
} from '../controllers/formController.js';

const router = express.Router();

router.post('/volunteer', submitVolunteer);
router.post('/partner', submitPartner);
router.post('/teacher', submitTeacher);
router.post('/internship', submitInternship);

export default router;
