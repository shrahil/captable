import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink to="/dashboard" className="nav-link">
              <i className="bi bi-speedometer2 me-2"></i>
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/cap-table" className="nav-link">
              <i className="bi bi-table me-2"></i>
              Cap Table
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/shareholders" className="nav-link">
              <i className="bi bi-people me-2"></i>
              Shareholders
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/share-classes" className="nav-link">
              <i className="bi bi-diagram-3 me-2"></i>
              Share Classes
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/options" className="nav-link">
              <i className="bi bi-file-earmark-text me-2"></i>
              Stock Options
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/option-plans" className="nav-link">
              <i className="bi bi-folder me-2"></i>
              Option Plans
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/vesting-schedules" className="nav-link">
              <i className="bi bi-calendar-check me-2"></i>
              Vesting Schedules
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/reports" className="nav-link">
              <i className="bi bi-file-earmark-bar-graph me-2"></i>
              Reports
            </NavLink>
          </li>
          {isAdmin && (
            <li className="nav-item mt-3">
              <h6 className="sidebar-heading px-3 mt-4 mb-1 text-muted">
                <span>Admin</span>
              </h6>
              <NavLink to="/users" className="nav-link">
                <i className="bi bi-person-gear me-2"></i>
                User Management
              </NavLink>
              <NavLink to="/import" className="nav-link">
                <i className="bi bi-upload me-2"></i>
                Import Data
              </NavLink>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
