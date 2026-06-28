/**
 * Audit Logging Service
 * Logs all significant actions (admin actions, logins, data changes, etc.)
 */

const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class AuditService {
  /**
   * Create audit log entry
   * @param {Object} params - Audit log parameters
   * @param {string} params.userId - User ID performing the action (optional for failed logins)
   * @param {string} params.action - Action performed (e.g., 'LOGIN', 'APPROVE_APPLICATION', 'CREATE_USER')
   * @param {string} params.tableName - Table affected (optional)
   * @param {string} params.recordId - Record ID affected (optional)
   * @param {Object} params.oldData - Previous data state (optional)
   * @param {Object} params.newData - New data state (optional)
   * @param {string} params.ipAddress - Client IP address (optional)
   * @param {string} params.userAgent - Client user agent (optional)
   * @returns {Promise<Object>} Created audit log entry
   */
  static async log({
    userId = null,
    action,
    tableName = null,
    recordId = null,
    oldData = null,
    newData = null,
    ipAddress = null,
    userAgent = null,
  }) {
    try {
      const id = uuidv4();

      await sequelize.query(
        `INSERT INTO audit_logs (
          id, user_id, action, table_name, record_id,
          old_data, new_data, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        {
          replacements: [
            id,
            userId,
            action,
            tableName,
            recordId,
            oldData ? JSON.stringify(oldData) : null,
            newData ? JSON.stringify(newData) : null,
            ipAddress,
            userAgent,
          ],
          type: sequelize.QueryTypes.INSERT,
        }
      );

      return { id, action, userId, created_at: new Date() };
    } catch (error) {
      // Don't throw - audit logging shouldn't break the main operation
      console.error('Audit logging failed:', error.message);
      return null;
    }
  }

  /**
   * Log user login
   */
  static async logLogin(userId, ipAddress, userAgent, success = true) {
    return this.log({
      userId,
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      ipAddress,
      userAgent,
      newData: { success, timestamp: new Date() },
    });
  }

  /**
   * Log user logout
   */
  static async logLogout(userId, ipAddress, userAgent) {
    return this.log({
      userId,
      action: 'LOGOUT',
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log application approval/rejection
   */
  static async logApplicationAction(userId, applicationId, action, oldStatus, newStatus, reason = null) {
    return this.log({
      userId,
      action: `APPLICATION_${action.toUpperCase()}`,
      tableName: 'applications',
      recordId: applicationId,
      oldData: { status: oldStatus },
      newData: { status: newStatus, reason },
    });
  }

  /**
   * Log registration approval/decline
   */
  static async logRegistrationAction(userId, registrationId, action, oldStatus, newStatus, reason = null) {
    return this.log({
      userId,
      action: `REGISTRATION_${action.toUpperCase()}`,
      tableName: 'registrations',
      recordId: registrationId,
      oldData: { status: oldStatus },
      newData: { status: newStatus, reason },
    });
  }

  /**
   * Log user creation
   */
  static async logUserCreate(adminUserId, newUserId, userEmail, role) {
    return this.log({
      userId: adminUserId,
      action: 'USER_CREATE',
      tableName: 'users',
      recordId: newUserId,
      newData: { email: userEmail, role },
    });
  }

  /**
   * Log user update
   */
  static async logUserUpdate(adminUserId, targetUserId, changes) {
    return this.log({
      userId: adminUserId,
      action: 'USER_UPDATE',
      tableName: 'users',
      recordId: targetUserId,
      newData: changes,
    });
  }

  /**
   * Log user deletion
   */
  static async logUserDelete(adminUserId, targetUserId, userEmail) {
    return this.log({
      userId: adminUserId,
      action: 'USER_DELETE',
      tableName: 'users',
      recordId: targetUserId,
      oldData: { email: userEmail },
    });
  }

  /**
   * Log password change
   */
  static async logPasswordChange(userId, forced = false) {
    return this.log({
      userId,
      action: forced ? 'PASSWORD_FORCE_CHANGE' : 'PASSWORD_CHANGE',
      tableName: 'users',
      recordId: userId,
    });
  }

  /**
   * Log MFA events
   */
  static async logMFAEvent(userId, action, success = true) {
    return this.log({
      userId,
      action: `MFA_${action.toUpperCase()}`,
      newData: { success },
    });
  }

  /**
   * Log document download
   */
  static async logDocumentDownload(userId, documentId, applicationId, fileName, documentType, ipAddress, userAgent) {
    return this.log({
      userId,
      action: 'DOCUMENT_DOWNLOAD',
      tableName: 'application_documents',
      recordId: documentId,
      ipAddress,
      userAgent,
      newData: {
        application_id: applicationId,
        file_name: fileName,
        document_type: documentType,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Get audit logs with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of records to return
   * @param {number} options.offset - Number of records to skip
   * @param {string} options.userId - Filter by user ID
   * @param {string} options.action - Filter by action
   * @param {string} options.tableName - Filter by table name
   * @param {Date} options.startDate - Filter by start date
   * @param {Date} options.endDate - Filter by end date
   * @returns {Promise<Object>} Audit logs and total count
   */
  static async getAuditLogs({
    limit = 50,
    offset = 0,
    userId = null,
    action = null,
    tableName = null,
    startDate = null,
    endDate = null,
  } = {}) {
    try {
      let whereConditions = [];
      let replacements = [];

      if (userId) {
        whereConditions.push('al.user_id = ?');
        replacements.push(userId);
      }

      if (action) {
        whereConditions.push('al.action = ?');
        replacements.push(action);
      }

      if (tableName) {
        whereConditions.push('al.table_name = ?');
        replacements.push(tableName);
      }

      if (startDate) {
        whereConditions.push('al.created_at >= ?');
        replacements.push(startDate);
      }

      if (endDate) {
        whereConditions.push('al.created_at <= ?');
        replacements.push(endDate);
      }

      const whereClause = whereConditions.length > 0
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

      // Get total count
      const countResult = await sequelize.query(
        `SELECT COUNT(*) as total FROM audit_logs al ${whereClause}`,
        {
          replacements,
          type: sequelize.QueryTypes.SELECT,
        }
      );
      const total = parseInt(countResult[0].total, 10);

      // Get audit logs with user details
      const logs = await sequelize.query(
        `SELECT
          al.id,
          al.user_id,
          al.action,
          al.table_name,
          al.record_id,
          al.old_data,
          al.new_data,
          al.ip_address,
          al.user_agent,
          al.created_at,
          u.email as user_email,
          ud.first_name,
          ud.last_name,
          u.role as user_role
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        LEFT JOIN user_details ud ON u.id = ud.user_id
        ${whereClause}
        ORDER BY al.created_at DESC
        LIMIT ? OFFSET ?`,
        {
          replacements: [...replacements, limit, offset],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return {
        logs,
        total,
        limit,
        offset,
        hasMore: offset + logs.length < total,
      };
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error.message);
      throw error;
    }
  }

  /**
   * Get audit log statistics
   */
  static async getAuditStats(startDate = null, endDate = null) {
    try {
      let dateFilter = '';
      let replacements = [];

      if (startDate) {
        dateFilter = 'WHERE created_at >= ?';
        replacements.push(startDate);

        if (endDate) {
          dateFilter += ' AND created_at <= ?';
          replacements.push(endDate);
        }
      } else if (endDate) {
        dateFilter = 'WHERE created_at <= ?';
        replacements.push(endDate);
      }

      const stats = await sequelize.query(
        `SELECT
          COUNT(*) as total_events,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(CASE WHEN action LIKE 'LOGIN%' THEN 1 END) as login_events,
          COUNT(CASE WHEN action LIKE 'APPLICATION%' THEN 1 END) as application_events,
          COUNT(CASE WHEN action LIKE 'REGISTRATION%' THEN 1 END) as registration_events,
          COUNT(CASE WHEN action LIKE 'USER_%' THEN 1 END) as user_management_events
        FROM audit_logs
        ${dateFilter}`,
        {
          replacements,
          type: sequelize.QueryTypes.SELECT,
        }
      );

      return stats[0];
    } catch (error) {
      console.error('Failed to retrieve audit stats:', error.message);
      throw error;
    }
  }
}

module.exports = AuditService;
