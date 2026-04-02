/**
 * Dynamic parameter solver.
 * Each scenario defines variables and relationships.
 * Users toggle variables between 'input' and 'output'.
 * The solver computes outputs from inputs using formulas and inverses.
 */

/**
 * @param {Object} config
 * @param {Array} config.variables - [{id, label, unit, defaultValue, mode: 'input'|'output'}]
 * @param {Function} config.solve - (values, inputIds) => computed values
 * @returns solver instance
 */
export function createSolver(config) {
  const variables = config.variables.map(v => ({ ...v, value: v.defaultValue }));

  function getValues() {
    const vals = {};
    variables.forEach(v => { vals[v.id] = v.value; });
    return vals;
  }

  function getInputIds() {
    return variables.filter(v => v.mode === 'input').map(v => v.id);
  }

  function setValue(id, value) {
    const v = variables.find(x => x.id === id);
    if (v) v.value = value;
  }

  function toggleMode(id) {
    const v = variables.find(x => x.id === id);
    if (!v) return;
    v.mode = v.mode === 'input' ? 'output' : 'input';
  }

  function solve() {
    const values = getValues();
    const inputIds = getInputIds();
    const computed = config.solve(values, inputIds);
    variables.forEach(v => {
      if (v.mode === 'output' && computed[v.id] !== undefined) {
        v.value = computed[v.id];
      }
    });
  }

  function getVariables() {
    return variables;
  }

  return { getValues, getInputIds, setValue, toggleMode, solve, getVariables };
}
