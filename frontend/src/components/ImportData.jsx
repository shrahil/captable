import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/api';

const ImportData = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await reportService.importCapTableExcel(formData);
      
      setSuccess(`Import completed successfully. ${response.data.results.success} records processed.`);
      
      // If there are errors in the import, show them
      if (response.data.results.errors.length > 0) {
        setError(`${response.data.results.errors.length} errors occurred during import.`);
      }
      
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import data');
      console.error('Error importing data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Import Cap Table Data</h2>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="file" className="form-label">Excel File</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    id="file" 
                    onChange={handleFileChange}
                    accept=".xlsx,.xls"
                  />
                  <div className="form-text">
                    Upload an Excel file with cap table data. The file should contain columns for Name, Type, Email, Shares, etc.
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5>Expected Format:</h5>
                  <table className="table table-sm table-bordered">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Email</th>
                        <th>ShareClass</th>
                        <th>Shares</th>
                        <th>PricePerShare</th>
                        <th>IssueDate</th>
                        <th>...</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>John Doe</td>
                        <td>founder</td>
                        <td>john@example.com</td>
                        <td>Common</td>
                        <td>1000000</td>
                        <td>0.001</td>
                        <td>2023-01-01</td>
                        <td>...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="d-flex justify-content-between">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => navigate('/cap-table')}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={!file || loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Importing...
                      </>
                    ) : (
                      'Import Data'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportData;
