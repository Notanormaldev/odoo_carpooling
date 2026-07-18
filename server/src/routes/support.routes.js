import express from 'express';
import { getAIResponse } from '../services/support.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/chat', asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json(new ApiResponse(400, null, 'Message is required'));
  }
  
  const responseText = await getAIResponse(message);
  return res.status(200).json(new ApiResponse(200, { response: responseText }, 'AI response generated'));
}));

export default router;
