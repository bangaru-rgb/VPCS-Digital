import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dgalxobdjjvxbrogghhk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYWx4b2Jkamp2eGJyb2dnaGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5Njk3MDEsImV4cCI6MjA3NDU0NTcwMX0.JKr4k4wCUqxWxI6WRwJGj_65odBG8sBRxYchPILWjVs';

export const supabase = createClient(supabaseUrl, supabaseKey);