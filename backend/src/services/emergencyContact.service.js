/**
 * Emergency Contact Service
 *
 * Handles emergency contact management for students
 * Maximum 3 contacts per student, one can be marked as primary
 *
 * Design Reference: MISSING_FEATURES.md section 2.4
 */

const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class EmergencyContactService {
  /**
   * Get all emergency contacts for a student
   */
  async getStudentContacts(studentUserId) {
    const contacts = await sequelize.query(
      `SELECT
         id,
         student_user_id,
         name,
         relationship,
         phone,
         email,
         address,
         is_primary,
         created_at,
         updated_at
       FROM emergency_contacts
       WHERE student_user_id = ?
       ORDER BY is_primary DESC, created_at ASC`,
      {
        replacements: [studentUserId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return contacts;
  }

  /**
   * Get a specific emergency contact by ID
   */
  async getContactById(contactId, studentUserId = null) {
    const query = studentUserId
      ? `SELECT * FROM emergency_contacts WHERE id = ? AND student_user_id = ?`
      : `SELECT * FROM emergency_contacts WHERE id = ?`;

    const replacements = studentUserId ? [contactId, studentUserId] : [contactId];

    const [contact] = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    if (!contact) {
      throw { statusCode: 404, message: 'Emergency contact not found' };
    }

    return contact;
  }

  /**
   * Create a new emergency contact
   */
  async createContact(studentUserId, contactData) {
    const { name, relationship, phone, email, address, is_primary } = contactData;

    // Validate required fields
    if (!name || !relationship || !phone) {
      throw {
        statusCode: 400,
        message: 'name, relationship, and phone are required',
      };
    }

    // Check maximum contacts limit (3 per student)
    const existingContacts = await this.getStudentContacts(studentUserId);
    if (existingContacts.length >= 3) {
      throw {
        statusCode: 400,
        message: 'Maximum 3 emergency contacts allowed per student',
      };
    }

    const transaction = await sequelize.transaction();
    try {
      // If this contact is being set as primary, unset any existing primary
      if (is_primary) {
        await sequelize.query(
          `UPDATE emergency_contacts
           SET is_primary = false, updated_at = NOW()
           WHERE student_user_id = ?`,
          {
            replacements: [studentUserId],
            transaction,
          }
        );
      }

      const contactId = uuidv4();

      await sequelize.query(
        `INSERT INTO emergency_contacts (
           id, student_user_id, name, relationship, phone, email,
           address, is_primary, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            contactId,
            studentUserId,
            name.trim(),
            relationship.trim(),
            phone.trim(),
            email ? email.trim() : null,
            address ? address.trim() : null,
            Boolean(is_primary),
          ],
          transaction,
        }
      );

      await transaction.commit();

      return await this.getContactById(contactId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update an emergency contact
   */
  async updateContact(contactId, studentUserId, contactData) {
    const existing = await this.getContactById(contactId, studentUserId);

    const { name, relationship, phone, email, address, is_primary } = contactData;

    const transaction = await sequelize.transaction();
    try {
      // If setting this contact as primary, unset any other primary contacts
      if (is_primary && !existing.is_primary) {
        await sequelize.query(
          `UPDATE emergency_contacts
           SET is_primary = false, updated_at = NOW()
           WHERE student_user_id = ? AND id != ?`,
          {
            replacements: [studentUserId, contactId],
            transaction,
          }
        );
      }

      await sequelize.query(
        `UPDATE emergency_contacts SET
           name = ?,
           relationship = ?,
           phone = ?,
           email = ?,
           address = ?,
           is_primary = ?,
           updated_at = NOW()
         WHERE id = ? AND student_user_id = ?`,
        {
          replacements: [
            name !== undefined ? name.trim() : existing.name,
            relationship !== undefined ? relationship.trim() : existing.relationship,
            phone !== undefined ? phone.trim() : existing.phone,
            email !== undefined ? (email ? email.trim() : null) : existing.email,
            address !== undefined ? (address ? address.trim() : null) : existing.address,
            is_primary !== undefined ? Boolean(is_primary) : existing.is_primary,
            contactId,
            studentUserId,
          ],
          transaction,
        }
      );

      await transaction.commit();

      return await this.getContactById(contactId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete an emergency contact
   */
  async deleteContact(contactId, studentUserId) {
    // Verify contact exists and belongs to student
    await this.getContactById(contactId, studentUserId);

    await sequelize.query(
      `DELETE FROM emergency_contacts WHERE id = ? AND student_user_id = ?`,
      {
        replacements: [contactId, studentUserId],
      }
    );

    return { success: true, message: 'Emergency contact deleted successfully' };
  }

  /**
   * Set a contact as primary
   */
  async setPrimaryContact(contactId, studentUserId) {
    // Verify contact exists and belongs to student
    await this.getContactById(contactId, studentUserId);

    const transaction = await sequelize.transaction();
    try {
      // Unset all primary contacts for this student
      await sequelize.query(
        `UPDATE emergency_contacts
         SET is_primary = false, updated_at = NOW()
         WHERE student_user_id = ?`,
        {
          replacements: [studentUserId],
          transaction,
        }
      );

      // Set the specified contact as primary
      await sequelize.query(
        `UPDATE emergency_contacts
         SET is_primary = true, updated_at = NOW()
         WHERE id = ? AND student_user_id = ?`,
        {
          replacements: [contactId, studentUserId],
          transaction,
        }
      );

      await transaction.commit();

      return await this.getContactById(contactId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new EmergencyContactService();
