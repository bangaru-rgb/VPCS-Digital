// src/components/cashFlow.js
import React, { useState, useEffect, useMemo } from 'react';
import './cashFlow.css';
import { supabase } from '../lib/supabaseClient';

const CashFlow = () => {
  // State for transactions
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [typeFilter, setTypeFilter] = useState('All');
  const [partyFilter, setPartyFilter] = useState('All');

  // Format date from ISO to DD-MMM-YY format
  const formatDate = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    return `${day}-${month}-${year}`;
  };

  // Fetch transactions from Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data from Supabase cashflow table
        const { data, error } = await supabase
          .from('cashflow')
          .select('*')
          .order('date', { ascending: false }); // Order by date descending
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Process the data to convert strings to numbers and format dates
          let processedData = data.map(item => ({
            ...item,
            inflow: parseFloat(item.inflow) || 0,
            outflow: parseFloat(item.outflow) || 0,
            displayDate: formatDate(item.date) // Format date for display
          }));
          
          // Calculate running balance
          // First, sort by date ascending (oldest first)
          const sortedAsc = [...processedData].sort((a, b) => new Date(a.date) - new Date(b.date));
          
          // Calculate running balance from oldest to newest
          let runningBalance = 0;
          const withRunningBalance = sortedAsc.map(transaction => {
            runningBalance += transaction.inflow - transaction.outflow;
            return {
              ...transaction,
              runningBalance
            };
          });
          
          // Sort back to descending (newest first) for display
          const sortedDesc = withRunningBalance.reverse();
          setTransactions(sortedDesc);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
    
    // Set up real-time subscription for updates
    const subscription = supabase
      .channel('cashflow-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cashflow' }, 
        (payload) => {
          console.log('Change received!', payload);
          fetchTransactions(); // Refresh data when changes occur
        }
      )
      .subscribe();
      
    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Get unique parties for filter dropdown
  const uniqueParties = useMemo(() => {
    if (transactions.length === 0) return ['All'];
    return ['All', ...new Set(transactions.map(t => t.party))];
  }, [transactions]);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      return (typeFilter === 'All' || transaction.type === typeFilter) &&
        (partyFilter === 'All' || transaction.party === partyFilter);
    });
  }, [transactions, typeFilter, partyFilter]);

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

  // Show loading state
  if (loading) {
    return (
      <div className="cashflow-container">
        <h1>Cash Flow</h1>
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="cashflow-container">
        <h1>Cash Flow</h1>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

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
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.displayDate}</td>
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
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`transaction-card ${transaction.type === 'Inflow' ? 'inflow-card' : 'outflow-card'}`}
            >
              <div className="card-header">
                <div className="date">{transaction.displayDate}</div>
                <div className={`type ${transaction.type === 'Inflow' ? 'inflow-type' : 'outflow-type'}`}>
                  {transaction.type}
                </div>
              </div>
              <div className="party">{transaction.party}</div>
              <div className="amounts">
                {transaction.type === 'Inflow' ? (
                  <>
                    <div className="amount-group">
                      <div className="amount-label">Recieved:</div>
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
                      <div className="amount-label">Given:</div>
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
              {transaction.comments && (
                <div className="comments">
                  <strong>Notes:</strong> {transaction.comments}
                </div>
              )}
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