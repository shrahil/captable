import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [capTableData, setCapTableData] = useState(null);
  const [optionsData, setOptionsData] = useState(null);
  const [vestingData, setVestingData] = useState(null);
  const [activeTab, setActiveTab] = useState('captable');
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (activeTab === 'captable' && !capTableData) {
          const response = await reportService.getCapTableReport();
          setCapTableData(response.data);
        } else if (activeTab === 'options' && !optionsData) {
          const response = await reportService.getOptionGrantsReport();
          setOptionsData(response.data);
        } else if (activeTab === 'vesting' && !vestingData) {
          const response = await reportService.getVestingReport();
          setVestingData(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load report data');
        console.error('Error fetching report data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [activeTab, capTableData, optionsData, vestingData]);

  const handleExportCSV = () => {
    window.location.href = 'http://localhost:5000/api/reports/export/captable';
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Reports</h2>
          <p className="text-muted">View and export cap table reports</p>
        </div>
        <div>
          {activeTab === 'captable' && (
            <button 
              className="btn btn-outline-primary" 
              onClick={handleExportCSV}
            >
              <i className="bi bi-download me-2"></i>
              Export CSV
            </button>
          )}
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'captable' ? 'active' : ''}`}
            onClick={() => setActiveTab('captable')}
          >
            Cap Table
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'options' ? 'active' : ''}`}
            onClick={() => setActiveTab('options')}
          >
            Option Grants
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'vesting' ? 'active' : ''}`}
            onClick={() => setActiveTab('vesting')}
          >
            Vesting Schedule
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading report data...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <>
          {activeTab === 'captable' && capTableData && (
            <div>
              <div className="row mb-4">
                <div className="col-md-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Total Shares</h5>
                      <h2 className="display-6">{capTableData.total_shares.toLocaleString()}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Shareholders</h5>
                      <h2 className="display-6">{capTableData.shareholders.length}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Share Classes</h5>
                      <h2 className="display-6">{capTableData.share_classes.length}</h2>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">Ownership by Share Class</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Share Class</th>
                          <th>Total Shares</th>
                          <th>% of Total</th>
                          <th>Shareholders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {capTableData.share_classes.map(shareClass => (
                          <tr key={shareClass.id}>
                            <td>{shareClass.name}</td>
                            <td>{shareClass.total_shares?.toLocaleString() || 0}</td>
                            <td>
                              {capTableData.total_shares > 0
                                ? ((shareClass.total_shares || 0) / capTableData.total_shares * 100).toFixed(2) + '%'
                                : '0.00%'}
                            </td>
                            <td>{shareClass.shareholder_count || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Shareholders</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Shares</th>
                          <th>Ownership %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {capTableData.shareholders.map(shareholder => (
                          <tr key={shareholder.id}>
                            <td>{shareholder.name}</td>
                            <td>
                              <span className={`badge bg-${
                                shareholder.type === 'founder' ? 'primary' :
                                shareholder.type === 'investor' ? 'success' :
                                shareholder.type === 'employee' ? 'info' :
                                'secondary'
                              }`}>
                                {shareholder.type}
                              </span>
                            </td>
                            <td>{shareholder.total_shares?.toLocaleString() || 0}</td>
                            <td>{shareholder.ownership_percentage?.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'options' && optionsData && (
            <div>
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Active Options</h5>
                      <h2 className="display-6">{optionsData.summary.total_active.toLocaleString()}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Exercised</h5>
                      <h2 className="display-6">{optionsData.summary.total_exercised.toLocaleString()}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Cancelled</h5>
                      <h2 className="display-6">{optionsData.summary.total_cancelled.toLocaleString()}</h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Total</h5>
                      <h2 className="display-6">{optionsData.summary.total_all.toLocaleString()}</h2>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Option Grants</h5>
                </div>
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
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {optionsData.options.map(option => (
                          <tr key={option.id}>
                            <td>{option.shareholder_name}</td>
                            <td>{option.option_plan_name}</td>
                            <td>{new Date(option.grant_date).toLocaleDateString()}</td>
                            <td>{option.quantity.toLocaleString()}</td>
                            <td>${parseFloat(option.exercise_price).toFixed(4)}</td>
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vesting' && vestingData && (
            <div>
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="card-title mb-0">Upcoming Vesting Events</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Vesting Date</th>
                          <th>Shareholder</th>
                          <th>Option Plan</th>
                          <th>Shares Vesting</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vestingData.upcoming_events.length > 0 ? (
                          vestingData.upcoming_events.map(event => (
                            <tr key={event.id}>
                              <td>{new Date(event.vesting_date).toLocaleDateString()}</td>
                              <td>{event.shareholder_name}</td>
                              <td>{event.option_plan_name}</td>
                              <td>{event.shares_vested.toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center">No upcoming vesting events</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Vesting by Month</h5>
                </div>
                <div className="card-body">
                  {Object.keys(vestingData.events_by_month).length > 0 ? (
                    Object.entries(vestingData.events_by_month).map(([month, events]) => {
                      const totalShares = events.reduce((sum, event) => sum + event.shares_vested, 0);
                      const date = new Date(month + '-01');
                      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                      
                      return (
                        <div key={month} className="mb-3">
                          <h6>{monthName} - {totalShares.toLocaleString()} shares</h6>
                          <div className="progress">
                            <div 
                              className="progress-bar" 
                              role="progressbar" 
                              style={{ width: `${Math.min(totalShares / 1000, 100)}%` }}
                              aria-valuenow={totalShares} 
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center">No vesting events scheduled</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
