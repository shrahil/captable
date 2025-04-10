import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shareholderService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CapTable = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [capTable, setCapTable] = useState({
    total_shares: 0,
    shareholders: [],
    share_classes: []
  });
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchCapTable = async () => {
      try {
        setLoading(true);
        const response = await shareholderService.getCapTable();
        // Ensure we have proper default values for all properties
        setCapTable({
          total_shares: response.data.total_shares || 0,
          shareholders: response.data.shareholders || [],
          share_classes: response.data.share_classes || []
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load cap table data');
        console.error('Error fetching cap table:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCapTable();
  }, []);

  const handleExportCSV = () => {
    window.location.href = 'http://localhost:5000/api/reports/export/captable';
  };

  // A helper function to safely format numbers
  const formatNumber = (num) => {
    return (num || 0).toLocaleString();
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Cap Table</h2>
          <p className="text-muted">Ownership summary for all shareholders</p>
        </div>
        <div>
          <button 
            className="btn btn-outline-primary me-2" 
            onClick={handleExportCSV}
          >
            <i className="bi bi-download me-2"></i>
            Export CSV
          </button>
          {isAdmin && (
            <Link to="/import" className="btn btn-primary">
              <i className="bi bi-upload me-2"></i>
              Import Data
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading cap table data...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Total Shares</h5>
                  <h2 className="display-6">{formatNumber(capTable.total_shares)}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Shareholders</h5>
                  <h2 className="display-6">{capTable.shareholders.length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Share Classes</h5>
                  <h2 className="display-6">{capTable.share_classes.length}</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Ownership by Share Class</h5>
            </div>
            <div className="card-body">
              {capTable.share_classes.length > 0 ? (
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
                      {capTable.share_classes.map((shareClass, index) => (
                        <tr key={shareClass.id || index}>
                          <td>{shareClass.name || 'Unnamed Class'}</td>
                          <td>{formatNumber(shareClass.total_shares)}</td>
                          <td>
                            {capTable.total_shares > 0
                              ? (((shareClass.total_shares || 0) / capTable.total_shares * 100).toFixed(2) + '%')
                              : '0.00%'}
                          </td>
                          <td>{shareClass.shareholder_count || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info">No share classes found.</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Shareholders</h5>
            </div>
            <div className="card-body">
              {capTable.shareholders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Shares</th>
                        <th>Ownership %</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {capTable.shareholders.map((shareholder, index) => (
                        <tr key={shareholder.id || index}>
                          <td>{shareholder.name || 'Unnamed'}</td>
                          <td>
                            <span className={`badge bg-${
                              shareholder.type === 'founder' ? 'primary' :
                              shareholder.type === 'investor' ? 'success' :
                              shareholder.type === 'employee' ? 'info' :
                              'secondary'
                            }`}>
                              {shareholder.type || 'Other'}
                            </span>
                          </td>
                          <td>{formatNumber(shareholder.total_shares)}</td>
                          <td>{(shareholder.ownership_percentage || 0).toFixed(2)}%</td>
                          <td>
                            <Link 
                              to={`/shareholders/${shareholder.id}`} 
                              className="btn btn-sm btn-outline-primary"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info">No shareholders found.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CapTable;