// src/agent/agentTools.js
import { supabase } from '../lib/supabaseClient';

// ── Tool Definitions ───────────────────────────────────────────────────────
export const toolDefinitions = [
  {
    name: 'get_users',
    description: 'Get list of approved users with their roles, status, and last login. Use for questions like "what role does Bangaru have" or "who has access to the system".',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search by full_name or email. Optional.' },
        role: { type: 'string', description: 'Filter by role e.g. Administrator, Management, Supervisor. Optional.' },
      },
    },
  },
  {
    name: 'get_roles',
    description: 'Get all roles defined in the system with role name, code, and employee name.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'get_cashflow',
    description: 'Get cash flow entries filtered by type (Inflow/Outflow). If no month is provided, returns all-time entries.',
    input_schema: {
      type: 'object',
      properties: {
        month: { type: 'string', description: 'Month in YYYY-MM format. Optional - if not provided, returns all-time data.' },
        type: { type: 'string', enum: ['Inflow', 'Outflow', 'all'], description: 'Filter by type. Default all.' },
      },
    },
  },
  {
    name: 'get_cashflow_summary',
    description: 'Get financial summary: total inflow, outflow, net balance, and running balance. If no month is provided, returns all-time totals.',
    input_schema: {
      type: 'object',
      properties: {
        month: { type: 'string', description: 'Month in YYYY-MM format. Optional - if not provided, returns all-time data.' },
      },
    },
  },
  {
    name: 'get_materials',
    description: 'Get list of materials with name, measurement unit, default rate, and status.',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['Active', 'Inactive', 'all'], description: 'Filter by status. Default all.' },
      },
    },
  },
  {
    name: 'get_parties',
    description: 'Get list of business parties (suppliers/customers). Can search by name/nickname or filter by status.',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search by party name or nickname. Optional.' },
        status: { type: 'string', enum: ['Active', 'Inactive', 'all'], description: 'Filter by status. Default all.' },
      },
    },
  },
  {
    name: 'get_vendors',
    description: 'Get list of vendors with contact details and GST number.',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search by vendor name. Optional.' },
      },
    },
  },
  {
    name: 'get_units',
    description: 'Get list of business units (locations/branches) with address and contact info.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'get_base_companies',
    description: 'Get list of base companies with GST number, address, and contact info.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'get_tankers',
    description: 'Get list of tankers with transporter name, tanker number, capacity, and status.',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search by transporter name or tanker number. Optional.' },
        status: { type: 'string', enum: ['Active', 'Inactive', 'all'], description: 'Filter by status. Default all.' },
      },
    },
  },
  {
    name: 'get_invoices',
    description: 'Get invoices with payment status, totals, and pending amounts.',
    input_schema: {
      type: 'object',
      properties: {
        payment_status: { type: 'string', description: 'e.g. Paid, Unpaid, Partial. Optional.' },
        month: { type: 'string', description: 'Month in YYYY-MM format. Optional.' },
        limit: { type: 'number', description: 'Max records. Default 20.' },
      },
    },
  },
  {
    name: 'get_invoice_items',
    description: 'Get invoice line items with material costs, GST, TCS, PCB/APEMCL charges for a specific invoice.',
    input_schema: {
      type: 'object',
      properties: {
        invoice_id: { type: 'string', description: 'Invoice UUID. Required.' },
      },
      required: ['invoice_id'],
    },
  },
  {
    name: 'get_shipments',
    description: 'Get shipments with status, quantity (KL), weight (MT), tanker number, and dispatch/delivery dates.',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by shipment_status e.g. Pending, Delivered, In Transit. Optional.' },
        month: { type: 'string', description: 'Month in YYYY-MM format for dispatch_date. Optional.' },
        limit: { type: 'number', description: 'Max records. Default 20.' },
      },
    },
  },
  {
    name: 'get_transactions',
    description: 'Get business transactions with payment info, amounts, invoice numbers, payment status, and bank details.',
    input_schema: {
      type: 'object',
      properties: {
        month: { type: 'string', description: 'Month in YYYY-MM format. Optional.' },
        payment_status: { type: 'string', description: 'Filter by payment_status. Optional.' },
        transaction_status: { type: 'string', description: 'Filter by transaction_status. Optional.' },
        limit: { type: 'number', description: 'Max records. Default 20.' },
      },
    },
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function monthRange(month) {
  const startDate = `${month}-01`;
  const end = new Date(month + '-01');
  end.setMonth(end.getMonth() + 1);
  return { startDate, endDate: end.toISOString().slice(0, 10) };
}

// ── Tool Implementations ───────────────────────────────────────────────────
export async function runTool(name, input) {
  switch (name) {

    case 'get_users': {
      let query = supabase
        .from('Approved_Users')
        .select('full_name, email, role, status, last_login, approved_by, approved_at, notes')
        .order('full_name');
      if (input.role) query = query.eq('role', input.role);
      if (input.search) {
        query = query.or(`full_name.ilike.%${input.search}%,email.ilike.%${input.search}%`);
      }
      const { data, error } = await query;
      if (error) return { error: error.message };
      return { count: data.length, users: data };
    }

    case 'get_roles': {
      const { data, error } = await supabase
        .from('Roles')
        .select('Role, Role_Code, Emp_Name, Login_ID')
        .order('Role_Code');
      if (error) return { error: error.message };
      return { count: data.length, roles: data };
    }

    case 'get_cashflow': {
      let query = supabase
        .from('cashflow')
        .select('date, type, party, inflow, outflow, running_balance, comments')
        .order('date', { ascending: false });
      if (input.month) {
        const { startDate, endDate } = monthRange(input.month);
        query = query.gte('date', startDate).lt('date', endDate);
      }
      if (input.type && input.type !== 'all') query = query.eq('type', input.type);
      const { data, error } = await query;
      if (error) return { error: error.message };
      return { period: input.month || 'all-time', count: data.length, entries: data };
    }

    case 'get_cashflow_summary': {
      let query = supabase
        .from('cashflow')
        .select('type, inflow, outflow, running_balance, party');
      if (input.month) {
        const { startDate, endDate } = monthRange(input.month);
        query = query.gte('date', startDate).lt('date', endDate);
      }
      const { data, error } = await query;
      if (error) return { error: error.message };
      const totalInflow = data.reduce((s, t) => s + (parseFloat(t.inflow) || 0), 0);
      const totalOutflow = data.reduce((s, t) => s + (parseFloat(t.outflow) || 0), 0);
      const latestBalance = data.length > 0 ? (parseFloat(data[0].running_balance) || 0) : 0;
      const partyTotals = {};
      data.forEach(t => {
        if (!partyTotals[t.party]) partyTotals[t.party] = { inflow: 0, outflow: 0 };
        partyTotals[t.party].inflow += parseFloat(t.inflow) || 0;
        partyTotals[t.party].outflow += parseFloat(t.outflow) || 0;
      });
      return { period: input.month || 'all-time', totalInflow, totalOutflow, netBalance: totalInflow - totalOutflow, runningBalance: latestBalance, transactionCount: data.length, partyBreakdown: partyTotals };
    }

    case 'get_materials': {
      let query = supabase
        .from('Materials')
        .select('material_name, measurement_unit, default_rate, status')
        .order('material_name');
      if (input.status && input.status !== 'all') query = query.eq('status', input.status);
      const { data, error } = await query;
      if (error) return { error: error.message };
      return { count: data.length, materials: data };
    }

    case 'get_parties': {
      let query = supabase
        .from('Parties')
        .select('party_name, nickname, city, state, contact_person, phone, email, status')
        .order('party_name');
      if (input.status && input.status !== 'all') query = query.eq('status', input.status);
      if (input.search) {
        query = query.or(`party_name.ilike.%${input.search}%,nickname.ilike.%${input.search}%`);
      }
      const { data, error } = await query;
      if (error) return { error: error.message };
      return { count: data.length, parties: data };
    }

    case 'get_vendors': {
      let query = supabase
        .from('Vendors')
        .select('vendor_name, contact_person, gst_number, address, phone, email')
        .order('vendor_name');
      if (input.search) {
        query = query.ilike('vendor_name', `%${input.search}%`);
      }
      const { data, error } = await query;
      if (error) return { error: error.message };
      return { count: data.length, vendors: data };
    }

    case 'get_units': {
      const { data, error } = await supabase
        .from('Units')
        .select('unit_code, unit_name, address, city, state, contact_person, phone, email')
        .order('unit_name');
      if (error) return { error: error.message };
      return { count: data.length, units: data };
    }

    case 'get_base_companies': {
      const { data, error } = await supabase
        .from('Base_Company')
        .select('base_company_name, nickname, gst_number, address, contact_person, status')
        .order('base_company_name');
      if (error) return { error: error.message };
      return { count: data.length, companies: data };
    }

    case 'get_tankers': {
      let query = supabase
        .from('Tankers_Info')
        .select('Transporter_name, Tanker_number, Tanker_capacity, status')
        .order('Transporter_name');
      if (input.status && input.status !== 'all') query = query.eq('status', input.status);
      if (input.search) {
        query = query.or(`Transporter_name.ilike.%${input.search}%,Tanker_number.ilike.%${input.search}%`);
      }
      const { data, error } = await query;
      if (error) return { error: error.message };
      return { count: data.length, tankers: data };
    }

    case 'get_invoices': {
      const limit = input.limit || 20;
      let query = supabase
        .from('Invoices')
        .select('invoice_id, invoice_number, invoice_type, invoice_date, payment_date, total_amount, payment_status, amount_paid, amount_pending, remarks')
        .order('invoice_date', { ascending: false })
        .limit(limit);
      if (input.payment_status) query = query.eq('payment_status', input.payment_status);
      if (input.month) {
        const { startDate, endDate } = monthRange(input.month);
        query = query.gte('invoice_date', startDate).lt('invoice_date', endDate);
      }
      const { data, error } = await query;
      if (error) return { error: error.message };
      const totalAmount = data.reduce((s, i) => s + (parseFloat(i.total_amount) || 0), 0);
      const totalPending = data.reduce((s, i) => s + (parseFloat(i.amount_pending) || 0), 0);
      return { count: data.length, totalAmount, totalPending, invoices: data };
    }

    case 'get_invoice_items': {
      const { data, error } = await supabase
        .from('Invoice_Items')
        .select('material_name, weight, hetero_rate, customs_tax, pcb_charges, apemcl_charges, material_cost, material_price_hetero, gst, material_price_gst, tcs, vendor_material_cost, material_price_vendor, gst_vendor')
        .eq('invoice_id', input.invoice_id);
      if (error) return { error: error.message };
      return { count: data.length, items: data };
    }

    case 'get_shipments': {
      const limit = input.limit || 20;
      let query = supabase
        .from('Shipments')
        .select('shipment_number, to_location, tanker_number, quantity_kl, weight_mt, dispatch_date, expected_delivery_date, actual_delivery_date, shipment_status, remarks')
        .order('dispatch_date', { ascending: false })
        .limit(limit);
      if (input.status) query = query.eq('shipment_status', input.status);
      if (input.month) {
        const { startDate, endDate } = monthRange(input.month);
        query = query.gte('dispatch_date', startDate).lt('dispatch_date', endDate);
      }
      const { data, error } = await query;
      if (error) return { error: error.message };
      const totalWeight = data.reduce((s, r) => s + (parseFloat(r.weight_mt) || 0), 0);
      return { count: data.length, totalWeightMT: totalWeight, shipments: data };
    }

    case 'get_transactions': {
      const limit = input.limit || 20;
      let query = supabase
        .from('Transactions')
        .select('transaction_number, transaction_date, quantity, vendor_invoice_number, base_invoice_number, party_invoice_number, vendor_to_unit_amount, base_to_vendor_amount, advance_paid_to_vendor, advance_payment_date, payment_mode, bank_name, pending_due_amount, bill_to_party_amount, transaction_status, payment_status, comments')
        .order('transaction_date', { ascending: false })
        .limit(limit);
      if (input.month) {
        const { startDate, endDate } = monthRange(input.month);
        query = query.gte('transaction_date', startDate).lt('transaction_date', endDate);
      }
      if (input.payment_status) query = query.eq('payment_status', input.payment_status);
      if (input.transaction_status) query = query.eq('transaction_status', input.transaction_status);
      const { data, error } = await query;
      if (error) return { error: error.message };
      return { count: data.length, transactions: data };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}