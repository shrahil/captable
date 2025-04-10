import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { shareholderService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Shareholders = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareholders, setShareholders] = useState([]);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchShareholders = async () => {
      try {
        setLoading(true);
        // Use the getCapTable method to get shareholders with complete share information
        const response = await shareholderService.getCapTable();
        setShareholders(response.data.shareholders || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load shareholders');
        console.error('Error fetching shareholders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShareholders();
  }, []);

  // Helper function to format shareholder type for display
  const formatShareholderType = (type) => {
    switch (type) {
      case 'founder':
        return { label: 'Founder', className: 'bg-primary' };
      case 'investor':
        return { label: 'Investor', className: 'bg-success' };
      case 'employee':
        return { label: 'Employee', className: 'bg-info' };
      default:
        return { label: type || 'Other', className: 'bg-secondary' };
    }
  };

  // Helper function to format numbers with commas
  const formatNumber = (num) => {
    return (num || 0).toLocaleString();
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Shareholders</h2>
          <p className="text-muted">Manage company shareholders</p>
        </div>
        {isAdmin && (
          <Link to="/shareholders/new" className="btn btn-primary">
            <i className="bi bi-person-plus me-2"></i>
            Add Shareholder
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading shareholders...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            {shareholders.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Email</th>
                      <th>Total Shares</th>
                      <th>Ownership %</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shareholders.map((shareholder, index) => {
                      const type = formatShareholderType(shareholder.type);
                      return (
                        <tr key={shareholder.id || index}>
                          <td>{shareholder.name || 'Unnamed'}</td>
                          <td>
                            <span className={`badge ${type.className}`}>
                              {type.label}
                            </span>
                          </td>
                          <td>{shareholder.email || 'N/A'}</td>
                          <td>{formatNumber(shareholder.total_shares)}</td>
                          <td>{(shareholder.ownership_percentage || 0).toFixed(2)}%</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <Link 
                                to={`/shareholders/${shareholder.id}`} 
                                className="btn btn-outline-primary"
                              >
                                View
                              </Link>
                              {isAdmin && (
                                <Link 
                                  to={`/shareholders/${shareholder.id}/edit`} 
                                  className="btn btn-outline-secondary"
                                >
                                  Edit
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="mb-0">No shareholders found.</p>
                {isAdmin && (
                  <Link to="/shareholders/new" className="btn btn-primary mt-3">
                    <i className="bi bi-person-plus me-2"></i>
                    Add Your First Shareholder
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Shareholders;