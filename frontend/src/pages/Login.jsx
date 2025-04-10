import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');

  // Validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
  });

  // Initial form values
  const initialValues = {
    email: '',
    password: ''
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoginError('');
      await login(values);
      navigate('/dashboard');
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="auth-container card mt-5">
            <div className="card-body p-4">
              <div className="auth-logo text-center mb-4">
                <h2>GoodEd Technologies</h2>
                <h4>Cap Table Management</h4>
              </div>
              
              <h3 className="card-title text-center mb-4">Login</h3>
              
              {loginError && (
                <div className="alert alert-danger" role="alert">
                  {loginError}
                </div>
              )}
              
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        placeholder="Enter your email"
                      />
                      <ErrorMessage name="email" component="div" className="text-danger" />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <Field
                        type="password"
                        id="password"
                        name="password"
                        className="form-control"
                        placeholder="Enter your password"
                      />
                      <ErrorMessage name="password" component="div" className="text-danger" />
                    </div>
                    
                    <div className="d-grid gap-2 mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Logging in...
                          </>
                        ) : (
                          'Login'
                        )}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
              
              <div className="auth-footer mt-4 text-center">
                <p>Don't have an account? Contact your administrator.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
