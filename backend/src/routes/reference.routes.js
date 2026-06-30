const express = require('express');
const sequelize = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');

const router = express.Router();

router.get('/nationalities', async (_req, res, next) => {
  try {
    const rows = await sequelize.query(
      `SELECT name
       FROM reference_nationalities
       WHERE is_active = true
       ORDER BY sort_order ASC, name ASC`,
      { type: sequelize.QueryTypes.SELECT },
    );

    return ResponseHandler.success(
      res,
      rows.map((r) => r.name),
      'Nationalities retrieved successfully',
    );
  } catch (err) {
    next(err);
  }
});

router.get('/document-requirements', async (req, res, next) => {
  try {
    const applicantType = req.query.type; // 'sa_national' or 'foreign_national'
    let whereClause = 'is_active = true';

    if (applicantType === 'sa_national') {
      whereClause += " AND applicant_type IN ('sa_national', 'all')";
    } else if (applicantType === 'foreign_national') {
      whereClause += " AND applicant_type IN ('foreign_national', 'all')";
    }

    const rows = await sequelize.query(
      `SELECT document_name
       FROM reference_document_requirements
       WHERE ${whereClause}
       ORDER BY sort_order ASC, document_name ASC`,
      { type: sequelize.QueryTypes.SELECT },
    );

    return ResponseHandler.success(
      res,
      rows.map((r) => r.document_name),
      'Document requirements retrieved successfully',
    );
  } catch (err) {
    next(err);
  }
});

router.get('/qualifications', async (_req, res, next) => {
  try {
    // Fetch from the qualifications table (not reference_qualifications) because modules are linked there
    const rows = await sequelize.query(
      `SELECT q.id,
              q.code,
              q.name,
              q.faculty,
              q.duration_years,
              q.total_fee as total_credits,
              q.is_active
       FROM qualifications q
       WHERE q.is_active = true
       ORDER BY q.name ASC`,
      { type: sequelize.QueryTypes.SELECT },
    );

    // Fetch modules for each qualification
    const qualificationsWithModules = await Promise.all(
      rows.map(async (qual) => {
        const modules = await sequelize.query(
          `SELECT id, code, name, year, semester, credits, is_active
           FROM modules
           WHERE qualification_id = :qualId AND is_active = true
           ORDER BY year ASC, semester ASC, code ASC`,
          {
            replacements: { qualId: qual.id },
            type: sequelize.QueryTypes.SELECT,
          }
        );
        return { ...qual, modules };
      })
    );

    return ResponseHandler.success(
      res,
      qualificationsWithModules,
      'Reference qualifications retrieved successfully',
    );
  } catch (err) {
    next(err);
  }
});

router.get('/home-config', (_req, res) => {
  const currentYear = new Date().getFullYear();
  const foundingYear = Number(process.env.EDUHUB_FOUNDING_YEAR || 2001);
  const yearsOfExcellence = Math.max(1, currentYear - foundingYear);
  const alumniWorldwide = Number(process.env.EDUHUB_ALUMNI_WORLDWIDE || 50000);
  const popularProgrammesLimit = Math.max(
    1,
    Number(process.env.EDUHUB_HOME_POPULAR_PROGRAMMES_LIMIT || 4),
  );
  const display = {
    yearsOfExcellence: {
      label: process.env.EDUHUB_HOME_YEARS_LABEL || 'Years of Excellence',
      suffix: process.env.EDUHUB_HOME_YEARS_SUFFIX || '+',
    },
    alumniWorldwide: {
      label: process.env.EDUHUB_HOME_ALUMNI_LABEL || 'Alumni Worldwide',
      suffix: process.env.EDUHUB_HOME_ALUMNI_SUFFIX || '+',
    },
    qualifications: {
      label: process.env.EDUHUB_HOME_QUALIFICATIONS_LABEL || 'Qualifications',
      suffix: process.env.EDUHUB_HOME_QUALIFICATIONS_SUFFIX || '+',
    },
    campuses: {
      label: process.env.EDUHUB_HOME_CAMPUSES_LABEL || 'Campus Locations',
      suffix: process.env.EDUHUB_HOME_CAMPUSES_SUFFIX || '',
    },
  };

  return ResponseHandler.success(
    res,
    {
      yearsOfExcellence,
      alumniWorldwide,
      popularProgrammesLimit,
      display,
    },
    'Home config retrieved successfully',
  );
});

module.exports = router;
