// src/lib/supabaseClient.js - Production Version with Database Function
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
  'Administrator': ['calculator', 'cashflow', 'cashflowentry', 'transactions', 'tanker-management', 'base-company-management'],
  'Supervisor': ['tanker-management'],
  'Management': ['calculator', 'cashflow', 'tanker-management', 'base-company-management']
};

/**
 * Get the correct redirect URL based on environment
 */
const getRedirectUrl = () => {
  // Use environment variable if set
  if (process.env.REACT_APP_SITE_URL) {
    return process.env.REACT_APP_SITE_URL;
  }
  
  // For development, use root URL
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // For production on GitHub Pages
  if (window.location.hostname.includes('github.io')) {
    return 'https://bangaru-rgb.github.io/VPCS-Digital';
  }
  
  // Fallback to origin
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
export const checkApprovedUser = async (session) => {
  try {
    if (!session?.user) {
      return null;
    }

    const userEmail = session.user.email;
    const googleUserId = session.user.id;

    // Query Approved_Users table
    const { data, error } = await supabase
      .from('Approved_Users')
      .select('*')
      .eq('email', userEmail)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      console.error('Error querying Approved_Users:', error);
      return null;
    }

    console.log('✅ User authenticated:', userEmail);

    // Try using database function first (more reliable, bypasses RLS)
    const { error: funcError } = await supabase.rpc('update_user_login_data', {
      p_email: userEmail,
      p_google_user_id: googleUserId,
      p_last_login: new Date().toISOString(),
      p_full_name: session.user.user_metadata?.full_name || null,
      p_profile_photo_url: session.user.user_metadata?.avatar_url || null
    });

    if (funcError) {
      console.warn('Database function failed, trying direct update:', funcError.message);
      
      // Fallback to direct update
      const updateData = {
        last_login: new Date().toISOString(),
        google_user_id: googleUserId
      };

      if (session.user.user_metadata?.full_name) {
        updateData.full_name = session.user.user_metadata.full_name;
      }
      if (session.user.user_metadata?.avatar_url) {
        updateData.profile_photo_url = session.user.user_metadata.avatar_url;
      }

      const { error: updateError } = await supabase
        .from('Approved_Users')
        .update(updateData)
        .eq('id', data.id);

      if (updateError) {
        console.error('❌ Failed to update user login data:', updateError);
        console.error('This may cause issues with user tracking features.');
      } else {
        console.log('✅ User login data updated via direct update');
      }
    } else {
      console.log('✅ User login data updated via database function');
    }

    // Log the login
    await logLogin(userEmail, session.user.user_metadata?.full_name || data.full_name, true);

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
 * Log login attempt
 */
const logLogin = async (email, name, success) => {
  try {
    await supabase
      .from('Login_Audit')
      .insert([{
        user_email: email,
        user_name: name,
        success: success,
        user_agent: navigator.userAgent
      }]);
  } catch (error) {
    console.error('Failed to log login:', error);
    // Don't fail login if logging fails
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
        status: 'active'
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
