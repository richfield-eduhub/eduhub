/** @type {{ migration: { name: string, up: Function } }} */
module.exports = {
  migration: {
    name: "2026-04-30-richfield-comprehensive-data",

    up: async (queryInterface, Sequelize, transaction) => {
      console.log("📚 Seeding comprehensive Richfield reference data...");

      // ===== QUALIFICATION TYPES =====
      console.log("  → Seeding qualification types...");
      const qualificationTypes = [
        {
          code: "HC",
          name: "Higher Certificate",
          nqf_level: 5,
          min_credits: 120,
        },
        { code: "DIP", name: "Diploma", nqf_level: 6, min_credits: 360 },
        {
          code: "ADV_DIP",
          name: "Advanced Diploma",
          nqf_level: 7,
          min_credits: 120,
        },
        {
          code: "BACH",
          name: "Bachelor Degree",
          nqf_level: 7,
          min_credits: 360,
        },
        {
          code: "BACH_HON",
          name: "Bachelor Honours",
          nqf_level: 8,
          min_credits: 120,
        },
        {
          code: "PG_DIP",
          name: "Postgraduate Diploma",
          nqf_level: 8,
          min_credits: 120,
        },
        {
          code: "MASTERS",
          name: "Masters Degree",
          nqf_level: 9,
          min_credits: 180,
        },
      ];

      await queryInterface.bulkInsert(
        "reference_qualification_types",
        qualificationTypes.map((qt) => ({
          id: Sequelize.literal("uuid_generate_v4()"),
          code: qt.code,
          name: qt.name,
          nqf_level: qt.nqf_level,
          minimum_credits: qt.min_credits,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        })),
        { transaction },
      );

      // ===== FACULTIES =====
      console.log("  → Seeding faculties...");
      const faculties = [
        {
          code: "IT",
          name: "Faculty of Information Technology",
          abbreviation: "IT",
        },
        {
          code: "BMS",
          name: "Faculty of Business and Management Sciences",
          abbreviation: "BMS",
        },
      ];

      await queryInterface.bulkInsert(
        "reference_faculties",
        faculties.map((f) => ({
          id: Sequelize.literal("uuid_generate_v4()"),
          code: f.code,
          name: f.name,
          abbreviation: f.abbreviation,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        })),
        { transaction },
      );

      // ===== STUDY MODES =====
      console.log("  → Seeding study modes...");
      const studyModes = [
        {
          code: "CONTACT",
          name: "Contact Learning",
          description: "On-campus face-to-face learning",
        },
        {
          code: "DISTANCE",
          name: "Distance Learning",
          description: "Online/remote learning",
        },
        {
          code: "BLENDED",
          name: "Blended Learning",
          description: "Combination of contact and distance",
        },
      ];

      await queryInterface.bulkInsert(
        "reference_study_modes",
        studyModes.map((sm) => ({
          id: Sequelize.literal("uuid_generate_v4()"),
          code: sm.code,
          name: sm.name,
          description: sm.description,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        })),
        { transaction },
      );

      // ===== CAMPUSES =====
      console.log("  → Seeding campuses...");
      const campuses = [
        {
          code: "BRY",
          name: "Bryanston",
          city: "Johannesburg",
          province: "Gauteng",
          address: "193 Bryanston Dr, Bryanston",
          phone: "011 029 8371",
        },
        {
          code: "NTJ",
          name: "Newtown Junction",
          city: "Johannesburg",
          province: "Gauteng",
          address: "138 Lilian Ngoyi Street, Newtown",
          phone: "011 595 4300",
        },
        {
          code: "PTA",
          name: "Pretoria",
          city: "Pretoria",
          province: "Gauteng",
          address: "291 Helen Joseph Street",
          phone: "012 765 1700",
        },
        {
          code: "CEN",
          name: "Centurion",
          city: "Centurion",
          province: "Gauteng",
          address: "1269 Gordon Hood Avenue, Centurion Mall Offices",
          phone: "012 745 8113",
        },
        {
          code: "POL",
          name: "Polokwane",
          city: "Polokwane",
          province: "Limpopo",
          address: "Corner Hans Van Rensburg Street & Grobler St",
          phone: "015 817 2600",
        },
        {
          code: "CPT",
          name: "Cape Town",
          city: "Cape Town",
          province: "Western Cape",
          address: "112 Long Street, Cape Town City Centre",
          phone: "021 831 0701",
        },
        {
          code: "UML",
          name: "Umhlanga",
          city: "Durban",
          province: "KwaZulu-Natal",
          address: "Centenary Boulevard, Park Square, 5-9 Park Avenue",
          phone: "031 834 7500",
        },
        {
          code: "MSG",
          name: "Musgrave",
          city: "Durban",
          province: "KwaZulu-Natal",
          address: "135 Musgrave Road, Musgrave Centre",
          phone: "031 831 2200",
        },
        {
          code: "ONLINE",
          name: "Online Campus",
          city: "Virtual",
          province: "National",
          address: "Online",
          phone: "0861 321 321",
        },
      ];

      await queryInterface.bulkInsert(
        "reference_campuses",
        campuses.map((c) => ({
          id: Sequelize.literal("uuid_generate_v4()"),
          code: c.code,
          name: c.name,
          city: c.city,
          province: c.province,
          address: c.address,
          phone: c.phone,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        })),
        { transaction },
      );

      // ===== IT QUALIFICATIONS =====
      console.log("  → Seeding IT qualifications...");
      const itQualifications = [
        // Bachelor's Degrees
        {
          saqa_id: "122369",
          code: "BSCIT",
          name: "Bachelor of Science in Information Technology",
          abbreviation: "BSc IT",
          faculty: "IT",
          type: "BACH",
          nqf_level: 7,
          credits: 395,
          duration_years: 3,
          modes: ["CONTACT", "DISTANCE"],
        },

        // Diplomas
        {
          saqa_id: "88322",
          code: "DIT",
          name: "Diploma in Information Technology",
          abbreviation: "DIT",
          faculty: "IT",
          type: "DIP",
          nqf_level: 6,
          credits: 365,
          duration_years: 3,
          modes: ["CONTACT", "DISTANCE"],
        },

        // Higher Certificates
        {
          saqa_id: "82926",
          code: "HCIT",
          name: "Higher Certificate in Information Technology",
          abbreviation: "HCIT",
          faculty: "IT",
          type: "HC",
          nqf_level: 5,
          credits: 120,
          duration_years: 1,
          modes: ["CONTACT", "DISTANCE"],
        },
        {
          saqa_id: "111617",
          code: "HCCF",
          name: "Higher Certificate in Computer Forensics",
          abbreviation: "HCCF",
          faculty: "IT",
          type: "HC",
          nqf_level: 5,
          credits: 120,
          duration_years: 1,
          modes: ["DISTANCE"],
        },

        // Honours
        {
          saqa_id: "110089",
          code: "BSCITH",
          name: "Bachelor of Science Honours in Information Technology",
          abbreviation: "BSc IT Hons",
          faculty: "IT",
          type: "BACH_HON",
          nqf_level: 8,
          credits: 135,
          duration_years: 1,
          modes: ["DISTANCE"],
        },
      ];

      // ===== BUSINESS QUALIFICATIONS =====
      console.log("  → Seeding Business qualifications...");
      const businessQualifications = [
        // Bachelor's Degrees
        {
          saqa_id: "84948",
          code: "BCOM",
          name: "Bachelor of Commerce",
          abbreviation: "BCom",
          faculty: "BMS",
          type: "BACH",
          nqf_level: 7,
          credits: 375,
          duration_years: 3,
          modes: ["CONTACT", "DISTANCE"],
        },
        {
          saqa_id: "84948",
          code: "BCOMAGA",
          name: "Bachelor of Commerce - Associate General Accountant",
          abbreviation: "BCom AGA",
          faculty: "BMS",
          type: "BACH",
          nqf_level: 7,
          credits: 395,
          duration_years: 3,
          modes: ["CONTACT", "DISTANCE"],
        },
        {
          saqa_id: "84948",
          code: "BCOMAGAIT",
          name: "Bachelor of Commerce - Associate General Accountant IT",
          abbreviation: "BCom AGA-IT",
          faculty: "BMS",
          type: "BACH",
          nqf_level: 7,
          credits: 435,
          duration_years: 3,
          modes: ["CONTACT", "DISTANCE"],
        },
        {
          saqa_id: "88921",
          code: "BBA",
          name: "Bachelor of Business Administration",
          abbreviation: "BBA",
          faculty: "BMS",
          type: "BACH",
          nqf_level: 7,
          credits: 360,
          duration_years: 3,
          modes: ["CONTACT", "DISTANCE"],
        },
        {
          saqa_id: "94580",
          code: "BPM",
          name: "Bachelor of Public Management",
          abbreviation: "BPM",
          faculty: "BMS",
          type: "BACH",
          nqf_level: 7,
          credits: 360,
          duration_years: 3,
          modes: ["DISTANCE"],
        },

        // Diplomas
        {
          saqa_id: "88897",
          code: "DBA",
          name: "Diploma in Business Administration",
          abbreviation: "DBA",
          faculty: "BMS",
          type: "DIP",
          nqf_level: 6,
          credits: 360,
          duration_years: 3,
          modes: ["CONTACT", "DISTANCE"],
        },
        {
          saqa_id: "99717",
          code: "DLGM",
          name: "Diploma in Local Government Management",
          abbreviation: "DLGM",
          faculty: "BMS",
          type: "DIP",
          nqf_level: 6,
          credits: 360,
          duration_years: 3,
          modes: ["DISTANCE"],
        },

        // Higher Certificates
        {
          saqa_id: "90864",
          code: "HCBA",
          name: "Higher Certificate in Business Administration",
          abbreviation: "HCBA",
          faculty: "BMS",
          type: "HC",
          nqf_level: 5,
          credits: 125,
          duration_years: 1,
          modes: ["CONTACT", "DISTANCE"],
        },
        {
          saqa_id: "88901",
          code: "HCOA",
          name: "Higher Certificate in Office Administration",
          abbreviation: "HCOA",
          faculty: "BMS",
          type: "HC",
          nqf_level: 5,
          credits: 120,
          duration_years: 1,
          modes: ["CONTACT"],
        },
        {
          saqa_id: "94600",
          code: "HCLGM",
          name: "Higher Certificate in Local Government Management",
          abbreviation: "HCLGM",
          faculty: "BMS",
          type: "HC",
          nqf_level: 5,
          credits: 120,
          duration_years: 1,
          modes: ["DISTANCE"],
        },
        {
          saqa_id: "93928",
          code: "HCRPLA",
          name: "Higher Certificate in Recognition of Prior Learning Activities",
          abbreviation: "HCRPLA",
          faculty: "BMS",
          type: "HC",
          nqf_level: 5,
          credits: 120,
          duration_years: 1,
          modes: ["DISTANCE"],
        },

        // Postgraduate
        {
          saqa_id: "117681",
          code: "MBA",
          name: "Master of Business Administration",
          abbreviation: "MBA",
          faculty: "BMS",
          type: "MASTERS",
          nqf_level: 9,
          credits: 210,
          duration_years: 2,
          modes: ["DISTANCE"],
        },
        {
          saqa_id: "105754",
          code: "PGDM",
          name: "Postgraduate Diploma in Management",
          abbreviation: "PGDM",
          faculty: "BMS",
          type: "PG_DIP",
          nqf_level: 8,
          credits: 135,
          duration_years: 1,
          modes: ["DISTANCE"],
        },
      ];

      const allQualifications = [
        ...itQualifications,
        ...businessQualifications,
      ];

      await queryInterface.bulkInsert(
        "reference_qualifications",
        allQualifications.map((q) => ({
          id: Sequelize.literal("uuid_generate_v4()"),
          saqa_id: q.saqa_id,
          code: q.code,
          name: q.name,
          abbreviation: q.abbreviation,
          faculty_code: q.faculty,
          qualification_type_code: q.type,
          nqf_level: q.nqf_level,
          total_credits: q.credits,
          duration_years: q.duration_years,
          study_modes: q.modes.join(","),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        })),
        { transaction },
      );

      // ===== ELECTIVE SPECIALIZATIONS =====
      console.log("  → Seeding elective specializations...");
      const specializations = [
        // IT Specializations
        {
          code: "IT_PROG",
          name: "Programming",
          faculty: "IT",
          description: "Software development and programming",
        },
        {
          code: "IT_NET",
          name: "Network Engineering",
          faculty: "IT",
          description: "Network infrastructure and administration",
        },
        {
          code: "IT_EMT",
          name: "Emerging Technologies",
          faculty: "IT",
          description: "AI, Machine Learning, Data Science",
        },
        {
          code: "IT_MGT",
          name: "IT Management",
          faculty: "IT",
          description: "IT strategy and business management",
        },
        {
          code: "IT_BA",
          name: "Business Analysis",
          faculty: "IT",
          description: "Business systems analysis",
        },

        // BMS Specializations
        {
          code: "BMS_ACC",
          name: "Accounting",
          faculty: "BMS",
          description: "Financial accounting and reporting",
        },
        {
          code: "BMS_HRM",
          name: "Human Resource Management",
          faculty: "BMS",
          description: "People and talent management",
        },
        {
          code: "BMS_MKT",
          name: "Marketing Management",
          faculty: "BMS",
          description: "Marketing strategy and management",
        },
        {
          code: "BMS_SCM",
          name: "Supply Chain Management",
          faculty: "BMS",
          description: "Logistics and operations",
        },
        {
          code: "BMS_ECO",
          name: "Economics",
          faculty: "BMS",
          description: "Economic theory and practice",
        },
      ];

      await queryInterface.bulkInsert(
        "reference_specializations",
        specializations.map((s) => ({
          id: Sequelize.literal("uuid_generate_v4()"),
          code: s.code,
          name: s.name,
          faculty_code: s.faculty,
          description: s.description,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        })),
        { transaction },
      );

      console.log(
        "✅ Comprehensive Richfield reference data seeded successfully!",
      );
    },
  },
};
