// src/lib/supabaseClient.js - Fixed for ENUM status column
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dgalxobdjjvxbrogghhk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYWx4b2Jkamp2eGJyb2dnaGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Njk3MDEsImV4cCI6MjA3NDU0NTcwMX0.JKr4k4wCUqxWxI6WRwJGj_65odBG8sBRxYchPILWjVs';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// ============================================================================
// ⚠️ IMPORTANT: Update these values to match your enum!
// ============================================================================
// Run this SQL first to see your enum values:
// SELECT enumlabel FROM pg_enum WHERE enumtypid = 'record_status'::regtype;
//
// Then update these constants to match EXACTLY (including capitalization):
// ============================================================================

const STATUS_ACTIVE = 'Active';      // ⚠️ CHANGE THIS to match your enum
const STATUS_INACTIVE = 'Inactive';  // ⚠️ CHANGE THIS to match your enum
const STATUS_SUSPENDED = 'Suspended'; // ⚠️ CHANGE THIS to match your enum
const STATUS_Decommissioned = 'Decommissioned';    // ⚠️ CHANGE THIS to match your enum


/**
 * Role configuration mapping
 */
const ROLE_CONFIG = {
  'Administrator': {
    displayName: 'Administrator',
    color: '#667eea',
    icon: '🔐',
    description: 'Full system access'
  },
  'Supervisor': {
    displayName: 'Supervisor',
    color: '#48bb78',
    icon: '📊',
    description: 'Operations management'
  },
  'Management': {
    displayName: 'Management',
    color: '#ed8936',
    icon: '💼',
    description: 'Financial oversight'
  }
};

/**
 * Module definitions (what each role can access)
 */
const MODULE_ACCESS = {
  'Administrator': ['calculator', 'cashflow', 'cashflowentry', 'transactions', 'tanker-management', 'base-company-management', 'user-management', 'parties', 'material-management'],
  'Supervisor': ['tanker-management'],
  'Management': ['calculator', 'cashflow', 'tanker-management', 'base-company-management', 'parties', 'material-management']
};

/**
 * Get the correct redirect URL based on environment
 */
const getRedirectUrl = () => {
  // For production on GitHub Pages
  if (window.location.hostname.includes('github.io')) {
    return 'https://bangaru-rgb.github.io/VPCS-Digital/';  // Added trailing slash
  }
  
  if (process.env.REACT_APP_SITE_URL) {
    return process.env.REACT_APP_SITE_URL;
  }
  
  if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
    return 'http://localhost:3000';
  }
  
  return window.location.origin;
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  try {
    const redirectUrl = getRedirectUrl();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if user is approved and get their access configuration
 */
// In supabase.js, modify the checkApprovedUser function

export const checkApprovedUser = async (session) => {
  try {
    if (!session?.user) {
      return null;
    }

    const userEmail = session.user.email;
    const googleUserId = session.user.id;

    console.log('🔍 Checking approval for:', userEmail);

    // Query Approved_Users table
    const { data, error } = await supabase
      .from('Approved_Users')
      .select('*')
      .eq('email', userEmail)
      .eq('status', STATUS_ACTIVE)
      .single();

    if (error || !data) {
      console.error('Error querying Approved_Users:', error);
      return null;
    }

    console.log('✅ User authenticated:', userEmail);

    // Update last login and other user data
    const updateData = {
      last_login: new Date().toISOString(),
      google_user_id: googleUserId,
      updated_by_user_id: googleUserId  // Track who last updated the record
    };

    if (session.user.user_metadata?.full_name) {
      updateData.full_name = session.user.user_metadata.full_name;
    }
    if (session.user.user_metadata?.avatar_url) {
      updateData.profile_photo_url = session.user.user_metadata.avatar_url;
    }

    // Update the user record
    const { error: updateError } = await supabase
      .from('Approved_Users')
      .update(updateData)
      .eq('id', data.id);

    if (updateError) {
      console.error('❌ Failed to update user login data:', updateError);
    } else {
      console.log('✅ User login data updated successfully');
    }

    // Log the login
    // await logLogin(userEmail, session.user.user_metadata?.full_name || data.full_name, true);
    // Note: Login_Audit table disabled - uncomment above when table is created

    // Return user info (rest of the function remains the same)
    const roleConfig = ROLE_CONFIG[data.role] || {};
    const modules = MODULE_ACCESS[data.role] || [];

    return {
      userId: data.id,
      email: data.email,
      role: data.role,
      name: data.full_name || session.user.user_metadata?.full_name || userEmail.split('@')[0],
      photo: data.profile_photo_url || session.user.user_metadata?.avatar_url,
      modules: modules,
      color: roleConfig.color || '#667eea',
      icon: roleConfig.icon || '👤',
      displayName: roleConfig.displayName || data.role,
      description: roleConfig.description || '',
      authUserId: googleUserId,
      EmpLogin_ID: data.id,
      sessionExpiry: session.expires_at
    };
  } catch (error) {
    console.error('Error checking approved user:', error);
    return null;
  }
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  try {
    await supabase.auth.signOut();
    localStorage.removeItem('userRole');
    localStorage.removeItem('lastLoginTime');
    
    // Redirect to home after logout
    window.location.href = getRedirectUrl();
    
    console.log('User signed out successfully');
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

/**
 * Refresh session
 */
export const refreshSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
};

/**
 * Check if user has access to a specific module
 */
export const hasModuleAccess = (userInfo, moduleName) => {
  if (!userInfo || !userInfo.modules) return false;
  return userInfo.modules.includes(moduleName);
};

/**
 * Get all approved users (Admin only)
 */
export const getAllApprovedUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('Approved_Users')
      .select('*')
      .order('approved_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching approved users:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add new approved user (Admin only)
 */
export const addApprovedUser = async (email, role, fullName, approvedBy, notes = '') => {
  try {
    const { data, error } = await supabase
      .from('Approved_Users')
      .insert([{
        email,
        role,
        full_name: fullName,
        approved_by: approvedBy,
        notes,
        status: STATUS_ACTIVE  // ✅ Using the constant that matches your enum
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding approved user:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user status (Admin only)
 */
export const updateUserStatus = async (userId, status) => {
  try {
    // Validate status value matches enum
    const validStatuses = [STATUS_ACTIVE, STATUS_INACTIVE, STATUS_SUSPENDED, STATUS_Decommissioned];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const { data, error } = await supabase
      .from('Approved_Users')
      .update({ status })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating user status:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all parties
 */
export const getAllParties = async () => {
  try {
    const { data, error } = await supabase
      .from('Parties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching parties:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add new party
 */
export const addParty = async (partyData) => {
  try {
    const { data, error } = await supabase
      .from('Parties')
      .insert([partyData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding party:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update party
 */
export const updateParty = async (partyId, updatedData) => {
  try {
    const { data, error } = await supabase
      .from('Parties')
      .update(updatedData)
      .eq('party_id', partyId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating party:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update party status
 */
export const updatePartyStatus = async (partyId, status) => {
  try {
    // Validate status value matches enum
    const validStatuses = [STATUS_ACTIVE, STATUS_INACTIVE, STATUS_SUSPENDED, STATUS_Decommissioned];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const { data, error } = await supabase
      .from('Parties')
      .update({ status })
      .eq('party_id', partyId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating party status:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// MATERIALS MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Get all materials
 */
export const getAllMaterials = async () => {
  try {
    const { data, error } = await supabase
      .from('Materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching materials:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add new material
 */
export const addMaterial = async (materialData) => {
  try {
    const { data, error } = await supabase
      .from('Materials')
      .insert([materialData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding material:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update material
 */
export const updateMaterial = async (materialId, updatedData) => {
  try {
    const { data, error } = await supabase
      .from('Materials')
      .update(updatedData)
      .eq('material_id', materialId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating material:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update material status
 */
export const updateMaterialStatus = async (materialId, status) => {
  try {
    // Validate status value matches enum
    const validStatuses = [STATUS_ACTIVE, STATUS_INACTIVE, STATUS_SUSPENDED, STATUS_Decommissioned];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const { data, error } = await supabase
      .from('Materials')
      .update({ status })
      .eq('material_id', materialId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating material status:', error);
    return { success: false, error: error.message };
  }
};