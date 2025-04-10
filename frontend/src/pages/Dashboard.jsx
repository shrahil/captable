import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col">
          <h2>Welcome, {user?.first_name}</h2>
          <p className="text-muted">Cap Table Management Dashboard</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card stat-card">
          <h3>Shareholders</h3>
          <div className="stat-value">
            <i className="bi bi-people me-2"></i>
            --
          </div>
          <Link to="/shareholders" className="btn btn-outline-primary">View Shareholders</Link>
        </div>

        <div className="card stat-card">
          <h3>Share Classes</h3>
          <div className="stat-value">
            <i className="bi bi-diagram-3 me-2"></i>
            --
          </div>
          <Link to="/share-classes" className="btn btn-outline-primary">View Share Classes</Link>
        </div>

        <div className="card stat-card">
          <h3>Stock Options</h3>
          <div className="stat-value">
            <i className="bi bi-file-earmark-text me-2"></i>
            --
          </div>
          <Link to="/options" className="btn btn-outline-primary">View Options</Link>
        </div>

        <div className="card stat-card">
          <h3>Option Plans</h3>
          <div className="stat-value">
            <i className="bi bi-folder me-2"></i>
            --
          </div>
          <Link to="/option-plans" className="btn btn-outline-primary">View Plans</Link>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/cap-table" className="btn btn-primary">
                  <i className="bi bi-table me-2"></i>
                  View Cap Table
                </Link>
                {isAdmin && (
                  <>
                    <Link to="/shareholders/new" className="btn btn-outline-primary">
                      <i className="bi bi-person-plus me-2"></i>
                      Add Shareholder
                    </Link>
                    <Link to="/options/new" className="btn btn-outline-primary">
                      <i className="bi bi-file-earmark-plus me-2"></i>
                      Grant Stock Options
                    </Link>
                  </>
                )}
                <Link to="/reports" className="btn btn-outline-primary">
                  <i className="bi bi-file-earmark-bar-graph me-2"></i>
                  Generate Reports
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Upcoming Vesting Events</h5>
            </div>
            <div className="card-body">
              <p className="text-muted">Loading upcoming vesting events...</p>
            </div>
            <div className="card-footer">
              <Link to="/reports/vesting" className="btn btn-sm btn-link">View All Vesting Events</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
