const bcrypt = require('bcrypt');

module.exports = {
  migration: {
    name: '2026-04-10-seed-default-accounts',

    up: async (queryInterface, Sequelize, transaction) => {
      console.log('👥 Creating default accounts...');
      const defaultPassword = await bcrypt.hash('Password123!', 10);
      const sequelize = queryInterface.sequelize;

      const adminId = '20000001-0000-4000-8000-000000000001';
      const lecturerId = '20000002-0000-4000-8000-000000000002';
      const studentId = '20000003-0000-4000-8000-000000000003';

      await sequelize.query(`INSERT INTO "Users" (id,email,password_hash,member_number,role,account_status,is_verified,is_default_password,created_at,updated_at) VALUES (:id,:email,:pw,:mn,:role,'active',true,true,NOW(),NOW()) ON CONFLICT (id) DO NOTHING`,
        { replacements:{id:adminId,email:'admin@eduhub.ac.za',pw:defaultPassword,mn:'ADMIN001',role:'admin'}, transaction });

      await sequelize.query(`INSERT INTO "User_Details" (id,user_id,first_name,last_name,date_of_birth,gender,nationality,id_number,phone,city,province,created_at,updated_at) VALUES (:id,:uid,'System','Admin','1990-01-01','other','South African','9001010001088','0800000000','Johannesburg','Gauteng',NOW(),NOW()) ON CONFLICT (id) DO NOTHING`,
        { replacements:{id:'21000001-0000-4000-8000-000000000001',uid:adminId}, transaction });

      await sequelize.query(`INSERT INTO "Users" (id,email,password_hash,member_number,role,account_status,is_verified,is_default_password,created_at,updated_at) VALUES (:id,:email,:pw,:mn,:role,'active',true,true,NOW(),NOW()) ON CONFLICT (id) DO NOTHING`,
        { replacements:{id:lecturerId,email:'john.smith@eduhub.ac.za',pw:defaultPassword,mn:'EMP2024001',role:'lecturer'}, transaction });

      await sequelize.query(`INSERT INTO "User_Details" (id,user_id,first_name,last_name,date_of_birth,gender,nationality,id_number,phone,city,province,created_at,updated_at) VALUES (:id,:uid,'John','Smith','1980-05-20','male','South African','8005200001083','0112345678','Johannesburg','Gauteng',NOW(),NOW()) ON CONFLICT (id) DO NOTHING`,
        { replacements:{id:'31000001-0000-4000-8000-000000000001',uid:lecturerId}, transaction });

      await sequelize.query(`INSERT INTO "Users" (id,email,password_hash,member_number,role,account_status,is_verified,is_default_password,created_at,updated_at) VALUES (:id,:email,:pw,:mn,:role,'active',true,true,NOW(),NOW()) ON CONFLICT (id) DO NOTHING`,
        { replacements:{id:studentId,email:'thabo.molefe@student.eduhub.ac.za',pw:defaultPassword,mn:'2026-0001',role:'student'}, transaction });

      await sequelize.query(`INSERT INTO "User_Details" (id,user_id,first_name,last_name,date_of_birth,gender,nationality,id_number,phone,city,province,created_at,updated_at) VALUES (:id,:uid,'Thabo','Molefe','2000-03-15','male','South African','0003150001083','0821234567','Johannesburg','Gauteng',NOW(),NOW()) ON CONFLICT (id) DO NOTHING`,
        { replacements:{id:'41000001-0000-4000-8000-000000000001',uid:studentId}, transaction });

      console.log('✅ Default accounts created successfully');
    },

    down: async (queryInterface, Sequelize, transaction) => {
      await queryInterface.sequelize.query(`DELETE FROM "Users" WHERE email IN ('admin@eduhub.ac.za','john.smith@eduhub.ac.za','thabo.molefe@student.eduhub.ac.za')`, { transaction });
    },
  },
};