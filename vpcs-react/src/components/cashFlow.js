// cashFlow.JS
import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo import
import './cashFlow.css';

const CashFlow = () => {
  // Updated transaction data - now wrapped in useMemo
  const rawData = useMemo(() => [
    { date: '24-Sep-25', type: 'Inflow', party: 'Srinu', inflow: 648600, outflow: 0 },
    { date: '16-Sep-25', type: 'Outflow', party: 'Pullareddy', inflow: 0, outflow: 495000 },
    { date: '15-Sep-25', type: 'Inflow', party: 'Ramji Bhai', inflow: 200000, outflow: 0 },
    { date: '13-Sep-25', type: 'Outflow', party: 'Headoffice', inflow: 0, outflow: 373500 },
    { date: '13-Sep-25', type: 'Outflow', party: 'Headoffice', inflow: 0, outflow: 335500 },
    { date: '13-Sep-25', type: 'Outflow', party: 'Pullareddy', inflow: 0, outflow: 487000 },
    { date: '6-Sep-25', type: 'Inflow', party: 'Unknown', inflow: 766000, outflow: 0 },
    { date: '21-Aug-25', type: 'Inflow', party: 'Ramji bhai', inflow: 600000, outflow: 0 },
    { date: '21-Aug-25', type: 'Outflow', party: 'Pullareddy', inflow: 0, outflow: 318600 },
    { date: '25-Jul-25', type: 'Outflow', party: 'Headoffice', inflow: 0, outflow: 276000 },
    { date: '14-Jul-25', type: 'Inflow', party: 'Ramji bhai', inflow: 350000, outflow: 0 },
    { date: '2-Jul-25', type: 'Inflow', party: 'Kalyan', inflow: 370000, outflow: 0 },
    { date: '10-Jun-25', type: 'Outflow', party: 'Prasad', inflow: 0, outflow: 460000 },
    { date: '2-Jun-25', type: 'Inflow', party: 'Prasad', inflow: 200000, outflow: 0 },
    { date: '23-May-25', type: 'Outflow', party: 'NISBA KARIM', inflow: 0, outflow: 100000 },
    { date: '23-May-25', type: 'Outflow', party: 'Pullareddy', inflow: 0, outflow: 680000 },
    { date: '22-May-25', type: 'Inflow', party: 'Ramji bhai', inflow: 350000, outflow: 0 },
    { date: '19-May-25', type: 'Inflow', party: 'Visakha', inflow: 296000, outflow: 0 },
    { date: '8-May-25', type: 'Outflow', party: 'Headoffice', inflow: 0, outflow: 698000 },
    { date: '2-May-25', type: 'Inflow', party: 'JayeshPatel', inflow: 1000000, outflow: 0 },
    { date: '21-Apr-25', type: 'Outflow', party: 'Ravikishore', inflow: 0, outflow: 500000 },
    { date: '20-Apr-25', type: 'Outflow', party: 'Pullareddy', inflow: 0, outflow: 515000 },
    { date: '4/19/25', type: 'Inflow', party: 'Old Ledger', inflow: 1107000, outflow: 0 },
  ], []); // Empty dependency array means this data is created only once

  // State for transactions
  const [transactions, setTransactions] = useState([]);
  
  // State for filters
  const [typeFilter, setTypeFilter] = useState('All');
  const [partyFilter, setPartyFilter] = useState('All');

  // Helper function to parse dates
  const parseDate = (dateStr) => {
    if (dateStr.includes('-')) {
      const [day, monthStr, year] = dateStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames.indexOf(monthStr);
      return new Date(`20${year}`, month, day);
    } else {
      const [month, day, year] = dateStr.split('/');
      return new Date(`20${year}`, month - 1, day);
    }
  };

  // Process transactions on component mount
  useEffect(() => {
    // Parse dates and sort by date (newest first)
    const parsedData = rawData.map(item => ({
      ...item,
      dateObj: parseDate(item.date)
    }));
    
    // Sort by date descending (newest first)
    parsedData.sort((a, b) => b.dateObj - a.dateObj);
    
    // Calculate running balance (starting from the oldest transaction)
    // We need to reverse to calculate from oldest to newest
    const reversedData = [...parsedData].reverse();
    let runningBalance = 0;
    
    const processedData = reversedData.map(item => {
      runningBalance += item.inflow - item.outflow;
      return {
        ...item,
        runningBalance
      };
    });
    
    // Reverse back to newest first for display
    setTransactions(processedData.reverse());
  }, [rawData]); // rawData is now stable due to useMemo

  // Get unique parties for filter dropdown
  const uniqueParties = useMemo(() => ['All', ...new Set(rawData.map(t => t.party))], [rawData]);

  // Apply filters
  const filteredTransactions = useMemo(() => transactions.filter(transaction => {
    return (typeFilter === 'All' || transaction.type === typeFilter) &&
           (partyFilter === 'All' || transaction.party === partyFilter);
  }), [transactions, typeFilter, partyFilter]);

  // Calculate totals
  const { totalInflow, totalOutflow, cashInHand } = useMemo(() => {
    const totalInflow = transactions.reduce((sum, t) => sum + t.inflow, 0);
    const totalOutflow = transactions.reduce((sum, t) => sum + t.outflow, 0);
    return {
      totalInflow,
      totalOutflow,
      cashInHand: totalInflow - totalOutflow
    };
  }, [transactions]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="cashflow-container">
      <h1>Cash Flow</h1>
      
      <div className="summary-cards">
        <div className="card">
          <h3>Cash Inflow</h3>
          <p>{formatCurrency(totalInflow)}</p>
        </div>
        <div className="card">
          <h3>Cash Outflow</h3>
          <p>{formatCurrency(totalOutflow)}</p>
        </div>
        <div className="card">
          <h3>Cash in hand</h3>
          <p>{formatCurrency(cashInHand)}</p>
        </div>
      </div>
      
      <div className="cashflow-table-container">
        {/* Filter dropdowns */}
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="type-filter">Type:</label>
            <select 
              id="type-filter" 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Inflow">Inflow</option>
              <option value="Outflow">Outflow</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="party-filter">Party:</label>
            <select 
              id="party-filter" 
              value={partyFilter} 
              onChange={(e) => setPartyFilter(e.target.value)}
            >
              {uniqueParties.map(party => (
                <option key={party} value={party}>{party}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="cashflow-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Party</th>
                <th>Inflow</th>
                <th>Outflow</th>
                <th>Running balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction, index) => (
                  <tr key={index}>
                    <td>{transaction.date}</td>
                    <td className={transaction.type === 'Inflow' ? 'inflow-type' : 'outflow-type'}>
                      {transaction.type}
                    </td>
                    <td>{transaction.party}</td>
                    <td className="inflow">{transaction.inflow > 0 ? formatCurrency(transaction.inflow) : '-'}</td>
                    <td className="outflow">{transaction.outflow > 0 ? formatCurrency(transaction.outflow) : '-'}</td>
                    <td className="balance">{formatCurrency(transaction.runningBalance)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No transactions available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Mobile cards view */}
      <div className="mobile-cards-view">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction, index) => (
            <div key={index} className="transaction-card">
              <div className="card-header">
                <div className="date">{transaction.date}</div>
                <div className={`type ${transaction.type === 'Inflow' ? 'inflow-type' : 'outflow-type'}`}>
                  {transaction.type}
                </div>
              </div>
              <div className="party">{transaction.party}</div>
              <div className="amounts">
                {transaction.type === 'Inflow' ? (
                  <>
                    <div className="amount-group">
                      <div className="amount-label">In:</div>
                      <div className="inflow amount-value">
                        {formatCurrency(transaction.inflow)}
                      </div>
                    </div>
                    <div className="amount-group">
                      <div className="amount-label">Running balance:</div>
                      <div className="balance amount-value">
                        {formatCurrency(transaction.runningBalance)}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="amount-group">
                      <div className="amount-label">Out:</div>
                      <div className="outflow amount-value">
                        {formatCurrency(transaction.outflow)}
                      </div>
                    </div>
                    <div className="amount-group">
                      <div className="amount-label">Running balance:</div>
                      <div className="balance amount-value">
                        {formatCurrency(transaction.runningBalance)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-transactions">No transactions available</div>
        )}
      </div>
    </div>
  );
};

export default CashFlow;