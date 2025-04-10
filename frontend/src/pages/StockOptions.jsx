import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { stockOptionService, shareholderService, vestingScheduleService, optionPlanService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const StockOptions = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState([]);
  const [shareholders, setShareholders] = useState([]);
  const [optionPlans, setOptionPlans] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    shareholder_id: '',
    option_plan_id: ''
  });
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch stock options with current filters
        const optionsResponse = await stockOptionService.getAll(filters);
        setOptions(optionsResponse.data.options);
        
        // Fetch shareholders for filter dropdown
        const shareholdersResponse = await shareholderService.getAll();
        setShareholders(shareholdersResponse.data.shareholders);
        
        // Fetch option plans for filter dropdown
        const plansResponse = await optionPlanService.getAll();
        setOptionPlans(plansResponse.data.plans);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load stock options');
        console.error('Error fetching stock options:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      shareholder_id: '',
      option_plan_id: ''
    });
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Stock Options</h2>
          <p className="text-muted">Manage stock option grants and exercises</p>
        </div>
        {isAdmin && (
          <Link to="/options/new" className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Grant New Options
          </Link>
        )}
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h5 className="card-title mb-0">Filters</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                id="status"
                name="status"
                className="form-select"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="exercised">Exercised</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="shareholder_id" className="form-label">Shareholder</label>
              <select
                id="shareholder_id"
                name="shareholder_id"
                className="form-select"
                value={filters.shareholder_id}
                onChange={handleFilterChange}
              >
                <option value="">All Shareholders</option>
                {shareholders.map(shareholder => (
                  <option key={shareholder.id} value={shareholder.id}>
                    {shareholder.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label htmlFor="option_plan_id" className="form-label">Option Plan</label>
              <select
                id="option_plan_id"
                name="option_plan_id"
                className="form-select"
                value={filters.option_plan_id}
                onChange={handleFilterChange}
              >
                <option value="">All Plans</option>
                {optionPlans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading stock options...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : options.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No stock options found with the current filters.
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Shareholder</th>
                    <th>Plan</th>
                    <th>Grant Date</th>
                    <th>Quantity</th>
                    <th>Exercise Price</th>
                    <th>Vesting Schedule</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {options.map(option => (
                    <tr key={option.id}>
                      <td>{option.shareholder_name}</td>
                      <td>{option.option_plan_name}</td>
                      <td>{new Date(option.grant_date).toLocaleDateString()}</td>
                      <td>{option.quantity.toLocaleString()}</td>
                      <td>${parseFloat(option.exercise_price).toFixed(4)}</td>
                      <td>{option.vesting_schedule_name}</td>
                      <td>
                        <span className={`badge bg-${
                          option.status === 'active' ? 'success' :
                          option.status === 'exercised' ? 'primary' :
                          option.status === 'cancelled' ? 'danger' :
                          'warning'
                        }`}>
                          {option.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <Link 
                            to={`/options/${option.id}`} 
                            className="btn btn-outline-primary"
                          >
                            View
                          </Link>
                          {option.status === 'active' && (
                            <Link 
                              to={`/options/${option.id}/exercise`} 
                              className="btn btn-outline-success"
                            >
                              Exercise
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockOptions;
