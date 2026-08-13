import React, { useState } from 'react';
import { loginUser } from '../services/authService';
import './Login.css';

function Login({ onNavigate, onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser(email, password);
      setSuccess(true);
      localStorage.setItem('token', res.token);

      if (onLoginSuccess) {
        onLoginSuccess(res.data, res.token);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Brand Icon */}
        <div className="login-brand-icon">
          ⚡
        </div>

        <h2 className="login-title">Admin Portal</h2>
        <p className="login-subtitle">Sign in to manage client project briefs</p>

        {error && <div className="alert-box alert-error">⚠️ {error}</div>}
        {success && <div className="alert-box alert-success">✓ Login successful! Redirecting...</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-field-wrap">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                name="email"
                className="login-input"
                disabled={loading}
                value={email}
                onChange={handleChange}
                placeholder="name@agency.com"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-field-wrap">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="password"
                className="login-input"
                disabled={loading}
                value={password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-login-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" /> Signing in...
              </>
            ) : (
              'Sign In to Dashboard →'
            )}
          </button>
        </form>

        <div className="login-footer">
          🔒 Secure Role-Based Access Control System
        </div>
      </div>
    </div>
  );
}

export default Login;

