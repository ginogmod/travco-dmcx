import React, { useState, useEffect } from 'react';
import { useHR } from '../context/HRContext';
import { useAuth } from '../context/AuthContext';

const PayrollManagement = () => {
  const { 
    employees, 
    payrolls, 
    fetchEmployees, 
    fetchAllPayrolls, 
    createPayroll, 
    addPayrollAddition, 
    addPayrollDeduction, 
    updatePayrollStatus 
  } = useHR();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [filteredPayrolls, setFilteredPayrolls] = useState([]);
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'addition', 'deduction', 'status'
  const [formData, setFormData] = useState({
    // Create payroll form
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    payrollType: 'main',
    baseSalary: 0,
    
    // Addition form
    additionType: 'bonus',
    additionAmount: 0,
    additionDescription: '',
    
    // Deduction form
    deductionType: 'tax',
    deductionAmount: 0,
    deductionDescription: '',
    
    // Status form
    paymentStatus: 'pending'
  });

  // Fetch employees and payrolls when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchEmployees();
        await fetchAllPayrolls();
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    
    if (user && (user.role === 'admin' || user.department === 'HR')) {
      fetchData();
    }
  }, [user, fetchEmployees, fetchAllPayrolls]);

  // Filter payrolls by year and month
  useEffect(() => {
    if (!payrolls) return;
    
    const filtered = payrolls.filter(payroll => 
      payroll.year === yearFilter && 
      (monthFilter === 0 || payroll.month === monthFilter)
    );
    
    setFilteredPayrolls(filtered);
    
    // Reset selected payroll if it's not in the filtered list
    if (selectedPayroll && !filtered.some(p => p._id === selectedPayroll._id)) {
      setSelectedPayroll(null);
    }
  }, [payrolls, yearFilter, monthFilter, selectedPayroll]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'JOD'
    }).format(amount);
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

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric values
    if (['month', 'year', 'baseSalary', 'additionAmount', 'deductionAmount'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'baseSalary' || name === 'additionAmount' || name === 'deductionAmount' 
          ? parseFloat(value) 
          : parseInt(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Set employee's salary when employee is selected
    if (name === 'employeeId' && employees) {
      const employee = employees.find(emp => emp._id === value);
      if (employee) {
        setSelectedEmployee(employee);
        setFormData(prev => ({
          ...prev,
          baseSalary: employee.salary
        }));
      }
    }
  };

  // Handle payroll selection
  const handleSelectPayroll = (payroll) => {
    setSelectedPayroll(payroll);
    
    // Set form data for the selected payroll
    setFormData(prev => ({
      ...prev,
      paymentStatus: payroll.paymentStatus
    }));
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
  };

  // Handle create payroll
  const handleCreatePayroll = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const payrollData = {
        employeeId: formData.employeeId,
        month: formData.month,
        year: formData.year,
        payrollType: formData.payrollType,
        baseSalary: formData.baseSalary
      };
      
      const result = await createPayroll(payrollData);
      
      if (result) {
        setSuccess('Payroll created successfully');
        setFormData(prev => ({
          ...prev,
          employeeId: '',
          baseSalary: 0
        }));
        setSelectedEmployee(null);
        await fetchAllPayrolls(); // Refresh the list
      } else {
        setError('Failed to create payroll');
      }
    } catch (error) {
      console.error('Error creating payroll:', error);
      setError('Error creating payroll');
    } finally {
      setLoading(false);
    }
  };

  // Handle add addition
  const handleAddAddition = async (e) => {
    e.preventDefault();
    
    if (!selectedPayroll) {
      setError('Please select a payroll first');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const additionData = {
        type: formData.additionType,
        amount: formData.additionAmount,
        description: formData.additionDescription
      };
      
      const result = await addPayrollAddition(selectedPayroll._id, additionData);
      
      if (result) {
        setSuccess('Addition added successfully');
        setFormData(prev => ({
          ...prev,
          additionType: 'bonus',
          additionAmount: 0,
          additionDescription: ''
        }));
        await fetchAllPayrolls(); // Refresh the list
      } else {
        setError('Failed to add addition');
      }
    } catch (error) {
      console.error('Error adding addition:', error);
      setError('Error adding addition');
    } finally {
      setLoading(false);
    }
  };

  // Handle add deduction
  const handleAddDeduction = async (e) => {
    e.preventDefault();
    
    if (!selectedPayroll) {
      setError('Please select a payroll first');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const deductionData = {
        type: formData.deductionType,
        amount: formData.deductionAmount,
        description: formData.deductionDescription
      };
      
      const result = await addPayrollDeduction(selectedPayroll._id, deductionData);
      
      if (result) {
        setSuccess('Deduction added successfully');
        setFormData(prev => ({
          ...prev,
          deductionType: 'tax',
          deductionAmount: 0,
          deductionDescription: ''
        }));
        await fetchAllPayrolls(); // Refresh the list
      } else {
        setError('Failed to add deduction');
      }
    } catch (error) {
      console.error('Error adding deduction:', error);
      setError('Error adding deduction');
    } finally {
      setLoading(false);
    }
  };

  // Handle update status
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    
    if (!selectedPayroll) {
      setError('Please select a payroll first');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await updatePayrollStatus(selectedPayroll._id, formData.paymentStatus);
      
      if (result) {
        setSuccess('Payroll status updated successfully');
        await fetchAllPayrolls(); // Refresh the list
      } else {
        setError('Failed to update payroll status');
      }
    } catch (error) {
      console.error('Error updating payroll status:', error);
      setError('Error updating payroll status');
    } finally {
      setLoading(false);
    }
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

  // Generate month options
  const generateMonthOptions = () => {
    const months = [];
    
    for (let i = 1; i <= 12; i++) {
      months.push({ value: i, label: getMonthName(i) });
    }
    
    return months;
  };

  if (loading && !employees && !payrolls) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Payroll Management</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payroll List */}
        <div className="lg:col-span-1 border-r pr-6">
          <h3 className="text-lg font-medium mb-4">Payroll Entries</h3>
          
          {/* Filters */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Year
              </label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Month
              </label>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>All Months</option>
                {generateMonthOptions().map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {filteredPayrolls.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No payroll entries found.</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredPayrolls.map((payroll) => {
                // Find employee name
                const employee = employees?.find(emp => emp._id === payroll.employeeId);
                const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
                
                return (
                  <div
                    key={payroll._id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedPayroll && selectedPayroll._id === payroll._id ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-700' : ''}`}
                    onClick={() => handleSelectPayroll(payroll)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{employeeName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {getMonthName(payroll.month)} {payroll.year} - {getPayrollTypeLabel(payroll.payrollType)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(payroll.paymentStatus)}`}>
                        {payroll.paymentStatus.charAt(0).toUpperCase() + payroll.paymentStatus.slice(1)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-semibold">
                        {formatCurrency(payroll.netSalary)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Payroll Management */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex border-b mb-6">
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'create' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => handleTabChange('create')}
            >
              Create Payroll
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'addition' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => handleTabChange('addition')}
              disabled={!selectedPayroll}
            >
              Add Addition
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'deduction' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => handleTabChange('deduction')}
              disabled={!selectedPayroll}
            >
              Add Deduction
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'status' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
              onClick={() => handleTabChange('status')}
              disabled={!selectedPayroll}
            >
              Update Status
            </button>
          </div>
          
          {/* Create Payroll Form */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreatePayroll}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Employee
                  </label>
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees && employees.map(employee => (
                      <option key={employee._id} value={employee._id}>
                        {employee.firstName} {employee.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Payroll Type
                  </label>
                  <select
                    name="payrollType"
                    value={formData.payrollType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="main">Regular Salary</option>
                    <option value="additional">Additional Payroll</option>
                    <option value="overtime">Overtime Payment</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Month
                  </label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {generateMonthOptions().map(month => (
                      <option key={month.value} value={month.value}>{month.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {generateYearOptions().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Base Salary
                  </label>
                  <input
                    type="number"
                    name="baseSalary"
                    value={formData.baseSalary}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Payroll'}
                </button>
              </div>
            </form>
          )}
          
          {/* Add Addition Form */}
          {activeTab === 'addition' && (
            <form onSubmit={handleAddAddition}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Addition Type
                  </label>
                  <select
                    name="additionType"
                    value={formData.additionType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="bonus">Bonus</option>
                    <option value="allowance">Allowance</option>
                    <option value="commission">Commission</option>
                    <option value="overtime">Overtime</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="additionAmount"
                    value={formData.additionAmount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="additionDescription"
                    value={formData.additionDescription}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  disabled={loading || !selectedPayroll}
                >
                  {loading ? 'Adding...' : 'Add Addition'}
                </button>
              </div>
            </form>
          )}
          
          {/* Add Deduction Form */}
          {activeTab === 'deduction' && (
            <form onSubmit={handleAddDeduction}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Deduction Type
                  </label>
                  <select
                    name="deductionType"
                    value={formData.deductionType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="tax">Tax</option>
                    <option value="insurance">Insurance</option>
                    <option value="loan">Loan</option>
                    <option value="absence">Absence</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="deductionAmount"
                    value={formData.deductionAmount}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="deductionDescription"
                    value={formData.deductionDescription}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  disabled={loading || !selectedPayroll}
                >
                  {loading ? 'Adding...' : 'Add Deduction'}
                </button>
              </div>
            </form>
          )}
          
          {/* Update Status Form */}
          {activeTab === 'status' && (
            <form onSubmit={handleUpdateStatus}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Payment Status
                </label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="processed">Processed</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={loading || !selectedPayroll}
                >
                  {loading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          )}
          
          {/* Selected Payroll Info */}
          {selectedPayroll && (activeTab === 'addition' || activeTab === 'deduction' || activeTab === 'status') && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium mb-3">Selected Payroll</h4>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Employee:</span>
                  <span className="ml-2 font-medium">
                    {employees?.find(emp => emp._id === selectedPayroll.employeeId)?.firstName || 'Unknown'} {employees?.find(emp => emp._id === selectedPayroll.employeeId)?.lastName || 'Employee'}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Period:</span>
                  <span className="ml-2 font-medium">
                    {getMonthName(selectedPayroll.month)} {selectedPayroll.year}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <span className="ml-2 font-medium">
                    {getPayrollTypeLabel(selectedPayroll.payrollType)}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className="ml-2 font-medium">
                    {selectedPayroll.paymentStatus.charAt(0).toUpperCase() + selectedPayroll.paymentStatus.slice(1)}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Base Salary:</span>
                  <span className="ml-2 font-medium">
                    {formatCurrency(selectedPayroll.baseSalary)}
                  </span>
                </div>
                
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Net Salary:</span>
                  <span className="ml-2 font-medium">
                    {formatCurrency(selectedPayroll.netSalary)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollManagement;