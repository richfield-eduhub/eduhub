/**
 * Audit Logs Routes — /api/audit/*
 * Admin-only access to view audit logs
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/roleCheck.middleware');
const AuditService = require('../services/audit.service');
const ResponseHandler = require('../utils/responseHandler');

// All audit routes require authentication and admin role
router.use(authenticateToken);
router.use(checkRole('admin'));

/**
 * GET /api/audit/logs
 * Get audit logs with pagination and filtering
 */
router.get('/logs', async (req, res, next) => {
  try {
    const {
      limit = 50,
      offset = 0,
      userId,
      action,
      tableName,
      startDate,
      endDate,
    } = req.query;

    const result = await AuditService.getAuditLogs({
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      userId,
      action,
      tableName,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });

    return ResponseHandler.success(res, result, 'Audit logs retrieved successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/stats
 * Get audit log statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await AuditService.getAuditStats(
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    return ResponseHandler.success(res, stats, 'Audit statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/actions
 * Get list of all unique actions (for filtering)
 */
router.get('/actions', async (req, res, next) => {
  try {
    const sequelize = require('../config/database');

    const actions = await sequelize.query(
      `SELECT DISTINCT action FROM audit_logs ORDER BY action`,
      { type: sequelize.QueryTypes.SELECT }
    );

    return ResponseHandler.success(
      res,
      actions.map(a => a.action),
      'Actions retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/tables
 * Get list of all unique table names (for filtering)
 */
router.get('/tables', async (req, res, next) => {
  try {
    const sequelize = require('../config/database');

    const tables = await sequelize.query(
      `SELECT DISTINCT table_name FROM audit_logs WHERE table_name IS NOT NULL ORDER BY table_name`,
      { type: sequelize.QueryTypes.SELECT }
    );

    return ResponseHandler.success(
      res,
      tables.map(t => t.table_name),
      'Tables retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
