/**
 * Formats a number as Indian Rupees (INR) currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "₹1,234.56")
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Export the function for use in other files
export default formatCurrency;