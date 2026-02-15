// src/config/rolesConfig.js
// Centralized configuration for role-based access control

/**
 * Define which modules each role can access
 * Available modules: 'calculator', 'cashflow', 'transactions'
 */
export const ROLE_MODULE_MAP = {
  'Administrator': {
    modules: ['calculator', 'cashflow', 'transactions'],
    displayName: 'Administrator',
    color: '#667eea',
    icon: '👑'
  },
  'Supervisor': {
    modules: ['calculator'],
    displayName: 'Supervisor',
    color: '#48bb78',
    icon: '📊'
  },
  'Management': {
    modules: ['calculator', 'cashflow'],
    displayName: 'Management',
    color: '#ed8936',
    icon: '💼'
  }
};

/**
 * Module configuration
 * Define display names and icons for each module
 */
export const MODULE_CONFIG = {
  calculator: {
    name: 'Material Price Calculator',
    icon: '📊',
    description: 'Calculate material costs and pricing'
  },
  cashflow: {
    name: 'Cash Flow',
    icon: '💰',
    description: 'Track income and expenses'
  },
  transactions: {
    name: 'Transactions Dashboard',
    icon: '📈',
    description: 'View all transactions and analytics'
  }
};

/**
 * Get access configuration for a role
 * @param {string} roleName - The role name from Supabase
 * @returns {object|null} Access configuration or null if role not found
 */
export const getRoleAccess = (roleName) => {
  const roleConfig = ROLE_MODULE_MAP[roleName];
  
  if (!roleConfig) {
    console.warn(`Role "${roleName}" not found in configuration`);
    return null;
  }

  return {
    role: roleName,
    modules: roleConfig.modules,
    name: roleConfig.displayName,
    color: roleConfig.color,
    icon: roleConfig.icon
  };
};

/**
 * Check if a role has access to a specific module
 * @param {string} roleName - The role name
 * @param {string} moduleName - The module to check
 * @returns {boolean} Whether the role has access
 */
export const hasModuleAccess = (roleName, moduleName) => {
  const roleConfig = ROLE_MODULE_MAP[roleName];
  if (!roleConfig) return false;
  return roleConfig.modules.includes(moduleName);
};

/**
 * Get all available modules for a role
 * @param {string} roleName - The role name
 * @returns {array} Array of module configurations
 */
export const getAvailableModules = (roleName) => {
  const roleConfig = ROLE_MODULE_MAP[roleName];
  if (!roleConfig) return [];

  return roleConfig.modules.map(moduleKey => ({
    key: moduleKey,
    ...MODULE_CONFIG[moduleKey]
  }));
};