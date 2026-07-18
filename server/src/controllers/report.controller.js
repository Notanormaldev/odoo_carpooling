import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as reportService from '../services/report.service.js';

export const getReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const report = await reportService.getOrgReport(req.user.orgId, startDate, endDate);
  return res.status(200).json(new ApiResponse(200, report, 'Organization report generated successfully'));
});

export default { getReport };
