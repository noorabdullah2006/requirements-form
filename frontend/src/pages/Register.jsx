import React, { useState } from 'react';
import { registerUser } from '../services/authService'; // Import our new auth service

function Register({ onNavigate }) {
  // Local state to keep track of user input fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // Controls button load state

  const { name, email, password } = formData;

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Basic Validation
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      
      // Make API call to our Node backend!
      const res = await registerUser(name, email, password);
      
      setSuccess(true);
      setFormData({ name: '', email: '', password: '' });
      
      // Auto navigate to Login after 2 seconds so they can log in
      setTimeout(() => {
        onNavigate();
      }, 2000);
    } catch (err) {
      // Capture error response message returned by Express backend
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Register</h2>
      
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {success && <p style={{ color: 'green', textAlign: 'center' }}>Registration successful! Redirecting to login...</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
          <input
            type="text"
            name="name"
            disabled={loading}
            value={name}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            placeholder="Enter your name"
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input
            type="email"
            name="email"
            disabled={loading}
            value={email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            placeholder="Enter your email"
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input
            type="password"
            name="password"
            disabled={loading}
            value={password}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            placeholder="Create a password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: loading ? '#6c757d' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Already have an account? <span onClick={onNavigate} style={{ color: '#007bff', cursor: 'pointer' }}>Login</span>
      </p>
    </div>
  );
}

export default Register;
