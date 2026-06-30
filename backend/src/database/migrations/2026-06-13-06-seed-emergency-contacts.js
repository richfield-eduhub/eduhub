/**
 * Migration: Seed Emergency Contacts
 *
 * Creates sample emergency contacts for the default student account (Thabo Molefe).
 * This demonstrates the emergency_contacts table functionality.
 */

module.exports = {
  migration: {
    name: '2026-06-13-06-seed-emergency-contacts',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('👥 Creating sample emergency contacts...');
      const sequelize = queryInterface.sequelize;

      // Check if emergency_contacts table exists
      try {
        await sequelize.query(`SELECT 1 FROM emergency_contacts LIMIT 1`);
      } catch (e) {
        console.log('⚠️  emergency_contacts table not found — skipping seed data');
        return;
      }

      // Student ID from default seed (Thabo Molefe)
      const studentId = '20000003-0000-4000-8000-000000000003';

      // Check if student exists
      const [students] = await sequelize.query(
        `SELECT id FROM users WHERE id = :studentId AND role = 'student'`,
        { replacements: { studentId }, transaction }
      );

      if (students.length === 0) {
        console.log('⚠️  Student not found — skipping emergency contacts');
        return;
      }

      // Insert emergency contacts
      const emergencyContacts = [
        {
          id: '30000001-0000-4000-8000-000000000001',
          student_id: studentId,
          name: 'Sarah Molefe',
          relationship: 'Mother',
          phone: '0821234567',
          alternate_phone: '0115551234',
          email: 'sarah.molefe@gmail.com',
          is_primary: true,
        },
        {
          id: '30000002-0000-4000-8000-000000000002',
          student_id: studentId,
          name: 'David Molefe',
          relationship: 'Father',
          phone: '0831234567',
          alternate_phone: null,
          email: 'david.molefe@gmail.com',
          is_primary: false,
        },
        {
          id: '30000003-0000-4000-8000-000000000003',
          student_id: studentId,
          name: 'Lerato Molefe',
          relationship: 'Sibling',
          phone: '0841234567',
          alternate_phone: null,
          email: 'lerato.molefe@gmail.com',
          is_primary: false,
        },
      ];

      for (const contact of emergencyContacts) {
        await sequelize.query(
          `INSERT INTO emergency_contacts
           (id, student_id, name, relationship, phone, alternate_phone, email, is_primary, created_at, updated_at)
           VALUES (:id, :student_id, :name, :relationship, :phone, :alternate_phone, :email, :is_primary, NOW(), NOW())
           ON CONFLICT (id) DO NOTHING`,
          { replacements: contact, transaction }
        );
      }

      console.log('✅ Created 3 emergency contacts for student Thabo Molefe');
    },

    down: async (queryInterface, Sequelize, transaction) => {
      const studentId = '20000003-0000-4000-8000-000000000003';
      await queryInterface.sequelize.query(
        `DELETE FROM emergency_contacts WHERE student_id = :studentId`,
        { replacements: { studentId }, transaction }
      );
    },
  },
};
