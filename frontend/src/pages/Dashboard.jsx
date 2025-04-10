import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { shareholderService, stockOptionService } from '../services/api';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    shareholderCount: '--',
    shareClassCount: '--',
    stockOptionCount: '--'
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch cap table data to get shareholder and share class counts
        const capTableResponse = await shareholderService.getCapTable();
        
        // Fetch stock options data
        const optionsResponse = await stockOptionService.getAll({});
        
        setDashboardData({
          shareholderCount: capTableResponse.data.shareholders?.length || '--',
          shareClassCount: capTableResponse.data.share_classes?.length || '--',
          stockOptionCount: optionsResponse.data.options?.length || '--'
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Display name based on user information
  const displayName = user?.first_name || (isAdmin ? 'Admin' : 'User');

  return (
    <div className="container pt-3">
      <h2>Welcome, {displayName}</h2>
      <p className="text-muted mb-4">Cap Table Management Dashboard</p>

      {/* Shareholders Section */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-2">Shareholders</h3>
              <div>
                <i className="bi bi-people me-2"></i>
                {dashboardData.shareholderCount}
              </div>
            </div>
            <Link to="/shareholders" className="text-primary">
              View Shareholders
            </Link>
          </div>
        </div>
      </div>

      {/* Share Classes Section */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-2">Share Classes</h3>
              <div>
                <i className="bi bi-diagram-3 me-2"></i>
                {dashboardData.shareClassCount}
              </div>
            </div>
            <Link to="/share-classes" className="text-primary">
              View Share Classes
            </Link>
          </div>
        </div>
      </div>

      {/* Stock Options Section */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-2">Stock Options</h3>
              <div>
                <i className="bi bi-file-earmark-text me-2"></i>
                {dashboardData.stockOptionCount}
              </div>
            </div>
            <Link to="/options" className="text-primary">
              View Options
            </Link>
          </div>
        </div>
      </div>

      {/* Only show additional admin actions if the user is an admin */}
      {isAdmin && (
        <div className="mt-4">
          <h3>Quick Actions</h3>
          <div className="row mt-3">
            <div className="col-md-3 mb-3">
              <Link to="/cap-table" className="btn btn-primary w-100">
                <i className="bi bi-table me-2"></i>
                View Cap Table
              </Link>
            </div>
            <div className="col-md-3 mb-3">
              <Link to="/shareholders/new" className="btn btn-outline-primary w-100">
                <i className="bi bi-person-plus me-2"></i>
                Add Shareholder
              </Link>
            </div>
            <div className="col-md-3 mb-3">
              <Link to="/options/new" className="btn btn-outline-primary w-100">
                <i className="bi bi-file-earmark-plus me-2"></i>
                Grant Options
              </Link>
            </div>
            <div className="col-md-3 mb-3">
              <Link to="/import" className="btn btn-outline-primary w-100">
                <i className="bi bi-upload me-2"></i>
                Import Data
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;