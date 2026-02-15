import React from 'react';
import './invoicesDashboard.css';

const InvoicesDashboard = () => {
  return (
    <div className="invoices-container">
      <h1>Transactions Dashboard</h1>
      
      <div className="filters">
        <div className="filter-group">
          <label>Date Range:</label>
          <input type="date" />
          <span>to</span>
          <input type="date" />
        </div>
        <div className="filter-group">
          <label>Vendor:</label>
          <select>
            <option>All Vendors</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Material:</label>
          <select>
            <option>All Materials</option>
          </select>
        </div>
        <div className="filter-group">
          <input type="text" placeholder="Search..." />
        </div>
      </div>
      
      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Vendor</th>
              <th>Material</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Total Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="7">No transactions available</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="graphs">
        <div className="graph-placeholder">
          <p>Bar Chart: Purchases per Vendor</p>
        </div>
        <div className="graph-placeholder">
          <p>Pie Chart: Material Distribution</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicesDashboard;