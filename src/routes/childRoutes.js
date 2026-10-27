import express from 'express';
import { getChildren, getChildById } from '../controllers/childController.js';

const router = express.Router();

router.get('/', getChildren);
router.get('/:id', getChildById);

export default router;
