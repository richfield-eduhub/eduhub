const NumberStore = require('./store');
const { generateStudentNumber, formatNumber } = require('./generator');
const { validateStudentNumber, ROLE_MAP } = require('./validator');

const defaultStore = new NumberStore();

async function generate({ year, role }) {
  const number = await generateStudentNumber({ year, role, store: defaultStore });
  return {
    number,
    formatted: formatNumber(number),
  };
}

function validate(input) {
  return validateStudentNumber(input);
}

function getRoleMap() {
  return { ...ROLE_MAP };
}

module.exports = {
  generate,
  validate,
  getRoleMap,
  NumberStore,
  generateStudentNumber,
  formatNumber,
  validateStudentNumber,
};
