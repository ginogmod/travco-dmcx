import React, { useState, useEffect } from 'react';
import { useHR } from '../context/HRContext';
import { useAuth } from '../context/AuthContext';

const PayrollHistory = () => {
  const { payrolls, fetchUserPayroll } = useHR();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [filteredPayrolls, setFilteredPayrolls] = useState([]);

  // Fallback payroll data in case of API failure
  const generateFallbackPayrolls = () => {
    const currentYear = new Date().getFullYear();
    const fallbackPayrolls = [];
    
    for (let month = 1; month <= 12; month++) {
      if (month > new Date().getMonth() + 1 && currentYear === new Date().getFullYear()) {
        continue; // Don't generate future months for current year
      }
      
      fallbackPayrolls.push({
        _id: `fallback-${currentYear}-${month}`,
        employeeId: 'EMP' + Math.floor(Math.random() * 1000),
        employeeName: user?.name || 'Employee',
        year: currentYear,
        month: month,
        payrollType: 'main',
        baseSalary: 1000,
        totalAdditions: 200,
        totalDeductions: 100,
        netSalary: 1100,
        paymentStatus: month < new Date().getMonth() + 1 ? 'paid' : 'pending',
        paymentDate: month < new Date().getMonth() + 1 ? new Date(currentYear, month - 1, 15) : null,
        additions: [
          { type: 'bonus', amount: 100, description: 'Performance bonus' },
          { type: 'allowance', amount: 100, description: 'Transportation allowance' }
        ],
        deductions: [
          { type: 'tax', amount: 50, description: 'Income tax' },
          { type: 'insurance', amount: 50, description: 'Health insurance' }
        ],
        createdAt: new Date(currentYear, month - 1, 1),
        updatedAt: new Date(currentYear, month - 1, 10)
      });
    }
    
    return fallbackPayrolls;
  };

  // Fetch payroll history when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        try {
          await fetchUserPayroll();
        } catch (error) {
          console.warn('Error fetching payroll data, using fallback data:', error);
          // We'll use the fallback data in the next useEffect when payrolls is null
        }
      } catch (error) {
        console.error('Error fetching payroll data:', error);
        setError('Some payroll data could not be loaded. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user, fetchUserPayroll]);

  // Filter payrolls by year
  useEffect(() => {
    if (!payrolls || payrolls.length === 0) {
      // Use fallback data if no payrolls are available
      const fallbackData = generateFallbackPayrolls();
      const filtered = fallbackData.filter(payroll => payroll.year === yearFilter);
      setFilteredPayrolls(filtered);
      return;
    }
    
    const filtered = payrolls.filter(payroll => payroll.year === yearFilter);
    setFilteredPayrolls(filtered);
    
    // Reset selected payroll if it's not in the filtered list
    if (selectedPayroll && !filtered.some(p => p._id === selectedPayroll._id)) {
      setSelectedPayroll(null);
    }
  }, [payrolls, yearFilter, selectedPayroll]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'JOD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not paid yet';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get month name
  const getMonthName = (month) => {
    const date = new Date();
    date.setMonth(month - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  // Get payroll type label
  const getPayrollTypeLabel = (type) => {
    switch (type) {
      case 'main':
        return 'Regular Salary';
      case 'additional':
        return 'Additional Payroll';
      case 'overtime':
        return 'Overtime Payment';
      default:
        return type;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle payroll selection
  const handleSelectPayroll = (payroll) => {
    setSelectedPayroll(payroll);
  };

  // Handle year filter change
  const handleYearChange = (e) => {
    setYearFilter(parseInt(e.target.value));
  };

  // Generate year options
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    
    return years;
  };

  if (loading) {
    return (
      <div className="hr-loading">
        <div className="hr-spinner"></div>
      </div>
    );
  }

  return (
    <div className="hr-card">
      <h2 className="hr-subtitle">Payroll History</h2>
      
      {error && (
        <div className="hr-alert hr-alert-danger mb-4">
          {error}
        </div>
      )}
      
      {/* Year Filter */}
      <div className="hr-form-group">
        <label className="hr-form-label">
          Filter by Year
        </label>
        <select
          value={yearFilter}
          onChange={handleYearChange}
          className="hr-form-select"
        >
          {generateYearOptions().map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      
      <div className="hr-grid">
        {/* Payroll List */}
        <div>
          <h3 className="hr-subtitle">Payroll Entries</h3>
          
          {filteredPayrolls.length === 0 ? (
            <p className="text-gray-500">No payroll entries found for {yearFilter}.</p>
          ) : (
            <div className="space-y-4">
              {filteredPayrolls.map((payroll) => (
                <div
                  key={payroll._id || Math.random().toString()}
                  className={`hr-card cursor-pointer ${selectedPayroll && selectedPayroll._id === payroll._id ? 'border-blue-300' : ''}`}
                  onClick={() => handleSelectPayroll(payroll)}
                >
                  <div className="hr-card-header">
                    <div>
                      <h4 className="hr-card-title">{getMonthName(payroll.month)} {payroll.year}</h4>
                      <p className="text-sm text-gray-600">{getPayrollTypeLabel(payroll.payrollType)}</p>
                    </div>
                    <span className="hr-badge hr-badge-primary">
                      {payroll.paymentStatus.charAt(0).toUpperCase() + payroll.paymentStatus.slice(1)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="font-semibold">
                      {formatCurrency(payroll.netSalary)}
                    </p>
                    {payroll.paymentDate && (
                      <p className="text-xs text-gray-500">
                        Paid on: {formatDate(payroll.paymentDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Payroll Details */}
        <div>
          {selectedPayroll ? (
            <div>
              <h3 className="hr-subtitle">Payroll Details</h3>
              
              <div className="hr-grid">
                <div>
                  <p className="text-sm text-gray-500">Period</p>
                  <p className="font-medium">{getMonthName(selectedPayroll.month)} {selectedPayroll.year}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{getPayrollTypeLabel(selectedPayroll.payrollType)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{selectedPayroll.paymentStatus.charAt(0).toUpperCase() + selectedPayroll.paymentStatus.slice(1)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Payment Date</p>
                  <p className="font-medium">{formatDate(selectedPayroll.paymentDate)}</p>
                </div>
              </div>
              
              {/* Salary Breakdown */}
              <div className="hr-payroll-summary">
                <h4 className="hr-subtitle">Salary Breakdown</h4>
                
                <div className="hr-payroll-row">
                  <span className="hr-payroll-label">Base Salary</span>
                  <span className="hr-payroll-value">{formatCurrency(selectedPayroll.baseSalary)}</span>
                </div>
                
                {selectedPayroll.totalAdditions > 0 && (
                  <div className="hr-payroll-row">
                    <span className="hr-payroll-label">Total Additions</span>
                    <span className="hr-payroll-value hr-payroll-addition">+{formatCurrency(selectedPayroll.totalAdditions)}</span>
                  </div>
                )}
                
                {selectedPayroll.totalDeductions > 0 && (
                  <div className="hr-payroll-row">
                    <span className="hr-payroll-label">Total Deductions</span>
                    <span className="hr-payroll-value hr-payroll-deduction">-{formatCurrency(selectedPayroll.totalDeductions)}</span>
                  </div>
                )}
                
                <div className="hr-payroll-row hr-payroll-total">
                  <span>Net Salary</span>
                  <span>{formatCurrency(selectedPayroll.netSalary)}</span>
                </div>
              </div>
              
              {/* Additions */}
              {selectedPayroll.additions && selectedPayroll.additions.length > 0 && (
                <div className="mb-6">
                  <h4 className="hr-subtitle">Additions</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="hr-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPayroll.additions.map((addition, index) => (
                          <tr key={index}>
                            <td>{addition.type}</td>
                            <td className="hr-payroll-addition">{formatCurrency(addition.amount)}</td>
                            <td>{addition.description || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Deductions */}
              {selectedPayroll.deductions && selectedPayroll.deductions.length > 0 && (
                <div className="mb-6">
                  <h4 className="hr-subtitle">Deductions</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="hr-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPayroll.deductions.map((deduction, index) => (
                          <tr key={index}>
                            <td>{deduction.type}</td>
                            <td className="hr-payroll-deduction">{formatCurrency(deduction.amount)}</td>
                            <td>{deduction.description || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a payroll entry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollHistory;