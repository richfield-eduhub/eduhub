/**
 * Emergency Contact Service
 *
 * Handles emergency contact management for students
 * Maximum 3 contacts per student, one can be marked as primary
 */

const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

function mapContactRow(contact) {
  if (!contact) {
    return contact;
  }

  return {
    id: contact.id,
    student_id: contact.student_id,
    full_name: contact.name,
    name: contact.name,
    relationship: contact.relationship,
    phone_number: contact.phone,
    phone: contact.phone,
    alternative_phone: contact.alternate_phone,
    alternate_phone: contact.alternate_phone,
    email: contact.email,
    address: contact.address,
    is_primary: contact.is_primary,
    created_at: contact.created_at,
    updated_at: contact.updated_at,
  };
}

function normalizeContactInput(contactData) {
  const name = contactData.name ?? contactData.full_name;
  const phone = contactData.phone ?? contactData.phone_number;
  const alternatePhone =
    contactData.alternate_phone ?? contactData.alternative_phone ?? null;

  return {
    name,
    relationship: contactData.relationship,
    phone,
    alternate_phone: alternatePhone,
    email: contactData.email ?? null,
    address: contactData.address ?? null,
    is_primary: Boolean(contactData.is_primary),
  };
}

class EmergencyContactService {
  /**
   * Get all emergency contacts for a student
   */
  async getStudentContacts(studentUserId) {
    const contacts = await sequelize.query(
      `SELECT
         id,
         student_id,
         name,
         relationship,
         phone,
         alternate_phone,
         email,
         address,
         is_primary,
         created_at,
         updated_at
       FROM emergency_contacts
       WHERE student_id = ?
       ORDER BY is_primary DESC, created_at ASC`,
      {
        replacements: [studentUserId],
        type: sequelize.QueryTypes.SELECT,
      },
    );

    return contacts.map(mapContactRow);
  }

  /**
   * Get a specific emergency contact by ID
   */
  async getContactById(contactId, studentUserId = null) {
    const query = studentUserId
      ? `SELECT * FROM emergency_contacts WHERE id = ? AND student_id = ?`
      : `SELECT * FROM emergency_contacts WHERE id = ?`;

    const replacements = studentUserId ? [contactId, studentUserId] : [contactId];

    const [contact] = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    if (!contact) {
      throw { statusCode: 404, message: 'Emergency contact not found' };
    }

    return mapContactRow(contact);
  }

  /**
   * Create a new emergency contact
   */
  async createContact(studentUserId, contactData) {
    const {
      name,
      relationship,
      phone,
      alternate_phone,
      email,
      address,
      is_primary,
    } = normalizeContactInput(contactData);

    if (!name || !relationship || !phone) {
      throw {
        statusCode: 400,
        message: 'name, relationship, and phone are required',
      };
    }

    const existingContacts = await this.getStudentContacts(studentUserId);
    if (existingContacts.length >= 3) {
      throw {
        statusCode: 400,
        message: 'Maximum 3 emergency contacts allowed per student',
      };
    }

    const transaction = await sequelize.transaction();
    try {
      if (is_primary) {
        await sequelize.query(
          `UPDATE emergency_contacts
           SET is_primary = false, updated_at = NOW()
           WHERE student_id = ?`,
          {
            replacements: [studentUserId],
            transaction,
          },
        );
      }

      const contactId = uuidv4();

      await sequelize.query(
        `INSERT INTO emergency_contacts (
           id, student_id, name, relationship, phone, alternate_phone, email,
           address, is_primary, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            contactId,
            studentUserId,
            name.trim(),
            relationship.trim(),
            phone.trim(),
            alternate_phone ? alternate_phone.trim() : null,
            email ? email.trim() : null,
            address ? address.trim() : null,
            is_primary,
          ],
          transaction,
        },
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
    const normalized = normalizeContactInput({
      ...existing,
      ...contactData,
    });

    const transaction = await sequelize.transaction();
    try {
      if (normalized.is_primary && !existing.is_primary) {
        await sequelize.query(
          `UPDATE emergency_contacts
           SET is_primary = false, updated_at = NOW()
           WHERE student_id = ? AND id != ?`,
          {
            replacements: [studentUserId, contactId],
            transaction,
          },
        );
      }

      await sequelize.query(
        `UPDATE emergency_contacts SET
           name = ?,
           relationship = ?,
           phone = ?,
           alternate_phone = ?,
           email = ?,
           address = ?,
           is_primary = ?,
           updated_at = NOW()
         WHERE id = ? AND student_id = ?`,
        {
          replacements: [
            normalized.name.trim(),
            normalized.relationship.trim(),
            normalized.phone.trim(),
            normalized.alternate_phone
              ? normalized.alternate_phone.trim()
              : null,
            normalized.email ? normalized.email.trim() : null,
            normalized.address ? normalized.address.trim() : null,
            normalized.is_primary,
            contactId,
            studentUserId,
          ],
          transaction,
        },
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
    await this.getContactById(contactId, studentUserId);

    await sequelize.query(
      `DELETE FROM emergency_contacts WHERE id = ? AND student_id = ?`,
      {
        replacements: [contactId, studentUserId],
      },
    );

    return { success: true, message: 'Emergency contact deleted successfully' };
  }

  /**
   * Set a contact as primary
   */
  async setPrimaryContact(contactId, studentUserId) {
    await this.getContactById(contactId, studentUserId);

    const transaction = await sequelize.transaction();
    try {
      await sequelize.query(
        `UPDATE emergency_contacts
         SET is_primary = false, updated_at = NOW()
         WHERE student_id = ?`,
        {
          replacements: [studentUserId],
          transaction,
        },
      );

      await sequelize.query(
        `UPDATE emergency_contacts
         SET is_primary = true, updated_at = NOW()
         WHERE id = ? AND student_id = ?`,
        {
          replacements: [contactId, studentUserId],
          transaction,
        },
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
