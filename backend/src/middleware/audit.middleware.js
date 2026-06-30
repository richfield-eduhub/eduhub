/**
 * Audit Logging Middleware
 * Automatically logs significant actions
 */

const AuditService = require('../services/audit.service');

/**
 * Extract client IP address from request
 */
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress ||
    req.connection.remoteAddress ||
    null
  );
}

/**
 * Extract user agent from request
 */
function getUserAgent(req) {
  return req.headers['user-agent'] || null;
}

/**
 * Middleware to log API requests to sensitive endpoints
 * @param {string} action - Action name to log
 */
function auditAction(action) {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json.bind(res);

    res.json = async function (data) {
      // Only log if request was successful (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await AuditService.log({
            userId: req.user?.user_id || req.user?.id || null,
            action,
            tableName: req.auditTableName || null,
            recordId: req.auditRecordId || data?.id || null,
            oldData: req.auditOldData || null,
            newData: req.auditNewData || data || null,
            ipAddress: getClientIp(req),
            userAgent: getUserAgent(req),
          });
        } catch (error) {
          console.error('Audit middleware error:', error.message);
          // Don't break the request flow
        }
      }

      return originalJson(data);
    };

    next();
  };
}

/**
 * Middleware to set audit metadata
 */
function setAuditMetadata(tableName, recordIdField = 'id') {
  return (req, res, next) => {
    req.auditTableName = tableName;
    req.auditRecordId = req.body?.[recordIdField] || req.params?.[recordIdField] || null;
    next();
  };
}

/**
 * Middleware to capture old data before update/delete
 */
function captureOldData(getDataFn) {
  return async (req, res, next) => {
    try {
      req.auditOldData = await getDataFn(req);
    } catch (error) {
      console.error('Failed to capture old data:', error.message);
    }
    next();
  };
}

module.exports = {
  auditAction,
  setAuditMetadata,
  captureOldData,
  getClientIp,
  getUserAgent,
};
