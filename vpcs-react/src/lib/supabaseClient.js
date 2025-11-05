// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dgalxobdjjvxbrogghhk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYWx4b2Jkamp2eGJyb2dnaGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Njk3MDEsImV4cCI6MjA3NDU0NTcwMX0.JKr4k4wCUqxWxI6WRwJGj_65odBG8sBRxYchPILWjVs';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Role to Module mapping
 * Define which modules each role can access
 */
const ROLE_MODULE_MAP = {
  'Administrator': {
    modules: ['calculator', 'cashflow', 'cashflowentry', 'transactions'],
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
 * Verify role code and get user access configuration
 * @param {number} roleCode - 6-digit role code
 * @returns {object|null} User access configuration or null if invalid
 */
export const verifyRoleCode = async (roleCode) => {
  try {
    const { data, error } = await supabase
      .from('roles') // Your table name in Supabase
      .select('*')
      .eq('Role_Code', roleCode)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    if (!data) {
      console.log('No role found for code:', roleCode);
      return null;
    }

    // Get role access configuration
    const roleConfig = ROLE_MODULE_MAP[data.Role];
    
    if (!roleConfig) {
      console.error(`Role "${data.Role}" not configured in ROLE_MODULE_MAP`);
      return null;
    }

    // Return complete access configuration
    return {
      role: data.Role,
      roleCode: data.Role_Code,
      roleId: data.id,
      modules: roleConfig.modules,
      name: roleConfig.displayName,
      color: roleConfig.color,
      icon: roleConfig.icon
    };
  } catch (error) {
    console.error('Error verifying role code:', error);
    return null;
  }
};

/**
 * Get all roles from Supabase (optional - for admin purposes)
 * @returns {array} Array of all roles
 */
export const getAllRoles = async () => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
};