/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: '2026-03-09-initial-schema',

    up: async (queryInterface, Sequelize, transaction) => {
      // ── Users ────────────────────────────────────────────────────────────
      await queryInterface.createTable(
        'Users',
        {
          id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
          studentNumber: { type: Sequelize.STRING, unique: true, allowNull: true },
          firstName: { type: Sequelize.STRING, allowNull: false },
          lastName: { type: Sequelize.STRING, allowNull: false },
          email: { type: Sequelize.STRING, allowNull: false, unique: true },
          password: { type: Sequelize.STRING, allowNull: false },
          role: {
            type: Sequelize.ENUM('admin', 'student', 'lecturer'),
            defaultValue: 'student',
          },
          isPasswordChanged: { type: Sequelize.BOOLEAN, defaultValue: false },
          createdAt: { type: Sequelize.DATE, allowNull: false },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction }
      );

      // ── Qualifications ───────────────────────────────────────────────────
      await queryInterface.createTable(
        'Qualifications',
        {
          id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
          code: { type: Sequelize.STRING, unique: true, allowNull: false },
          name: { type: Sequelize.STRING, allowNull: false },
          faculty: { type: Sequelize.STRING },
          durationYears: { type: Sequelize.INTEGER },
          totalFee: { type: Sequelize.DECIMAL(10, 2) },
          isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
          createdAt: { type: Sequelize.DATE, allowNull: false },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction }
      );

      // ── Modules ──────────────────────────────────────────────────────────
      await queryInterface.createTable(
        'Modules',
        {
          id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
          code: { type: Sequelize.STRING, unique: true, allowNull: false },
          name: { type: Sequelize.STRING, allowNull: false },
          credits: { type: Sequelize.INTEGER },
          year: { type: Sequelize.INTEGER },
          semester: { type: Sequelize.INTEGER },
          qualificationId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'Qualifications', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
          createdAt: { type: Sequelize.DATE, allowNull: false },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction }
      );

      // ── Semesters ────────────────────────────────────────────────────────
      await queryInterface.createTable(
        'Semesters',
        {
          id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
          name: { type: Sequelize.STRING, allowNull: false },
          year: { type: Sequelize.INTEGER, allowNull: false },
          semesterNumber: { type: Sequelize.INTEGER, allowNull: false },
          startDate: { type: Sequelize.DATEONLY },
          endDate: { type: Sequelize.DATEONLY },
          isActive: { type: Sequelize.BOOLEAN, defaultValue: false },
          registrationOpen: { type: Sequelize.BOOLEAN, defaultValue: false },
          createdAt: { type: Sequelize.DATE, allowNull: false },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction }
      );

      // ── Applications ─────────────────────────────────────────────────────
      await queryInterface.createTable(
        'Applications',
        {
          id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
          referenceNumber: { type: Sequelize.STRING, unique: true },

          // Personal
          firstName: { type: Sequelize.STRING, allowNull: false },
          lastName: { type: Sequelize.STRING, allowNull: false },
          idNumber: { type: Sequelize.STRING, allowNull: false },
          dateOfBirth: { type: Sequelize.DATEONLY, allowNull: false },
          gender: { type: Sequelize.ENUM('male', 'female', 'other'), allowNull: false },
          nationality: { type: Sequelize.STRING, allowNull: false },

          // Contact
          phone: { type: Sequelize.STRING, allowNull: false },
          email: { type: Sequelize.STRING, allowNull: false },
          addressStreet: { type: Sequelize.STRING },
          addressCity: { type: Sequelize.STRING },
          addressProvince: { type: Sequelize.STRING },
          addressPostalCode: { type: Sequelize.STRING },

          // Education
          highSchool: { type: Sequelize.STRING },
          matricYear: { type: Sequelize.INTEGER },
          matricSubjects: { type: Sequelize.JSONB },
          previousTertiary: { type: Sequelize.JSONB },

          // Payer
          payerName: { type: Sequelize.STRING },
          payerRelation: { type: Sequelize.STRING },
          payerPhone: { type: Sequelize.STRING },
          payerEmail: { type: Sequelize.STRING },

          // Qualification
          qualificationId: { type: Sequelize.INTEGER },
          qualificationName: { type: Sequelize.STRING },

          // Docs / T&Cs
          documents: { type: Sequelize.JSONB },
          termsAccepted: { type: Sequelize.BOOLEAN, defaultValue: false },

          // Status
          status: {
            type: Sequelize.ENUM('pending', 'approved', 'declined'),
            defaultValue: 'pending',
          },
          declineReason: { type: Sequelize.TEXT },

          // Linked user (set on approval)
          userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: { model: 'Users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },

          createdAt: { type: Sequelize.DATE, allowNull: false },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction }
      );

      // ── Registrations ────────────────────────────────────────────────────
      await queryInterface.createTable(
        'Registrations',
        {
          id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
          userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          semesterId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: 'Semesters', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          modules: { type: Sequelize.JSONB, allowNull: false },
          quotationAmount: { type: Sequelize.DECIMAL(10, 2) },
          status: {
            type: Sequelize.ENUM('pending', 'approved', 'declined'),
            defaultValue: 'pending',
          },
          declineReason: { type: Sequelize.TEXT },
          createdAt: { type: Sequelize.DATE, allowNull: false },
          updatedAt: { type: Sequelize.DATE, allowNull: false },
        },
        { transaction }
      );
    },
  },
};
