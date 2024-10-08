import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    console.log('Component mounted or updated');
  }, []);

  const handleClick = () => {
    console.log('Button clicked, count:', count + 1);
    setCount((prevCount) => prevCount + 1);
  };

  const fetchData = async () => {
    console.log('Fetching data...');
    try {
      const response = await axios.get('http://localhost:3000/users');
      if (response.data) {
        setMessage('Fetched data successfully.');
        console.log('Data fetched:', response.data);
      } else {
        setMessage('No data found in response.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage('Error fetching data.');
    }
  };

  const handleAuthToggle = () => {
    console.log('Toggling auth mode. Current mode:', isLogin ? 'Login' : 'Register');
    setIsLogin(!isLogin);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/login' : '/users';
    const payload = isLogin ? { email, password } : { name, email, password };

    console.log('Submitting auth form. Mode:', isLogin ? 'Login' : 'Register');
    console.log('Payload:', payload);

    try {
      const response = await axios.post(`http://localhost:3000${endpoint}`, payload);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.status === 200 || response.status === 201) {
        setMessage(response.data.message || (isLogin ? 'Login successful!' : 'Registration successful!'));
        console.log('Auth successful:', response.data);
      } else {
        setMessage('Authentication failed. Please try again.');
        console.log('Unexpected response status:', response.status);
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      if (error.response) {
        console.log('Error response details:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
        });
        if (error.response.data && error.response.data.error) {
          setMessage(error.response.data.error);
        } else {
          setMessage(`Authentication failed with status ${error.response.status}. Please try again.`);
        }
      } else {
        setMessage('Authentication failed. Please try again.');
      }
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Welcome to RocketApp!</h1>
        <p>Your ultimate platform for artists, producers, and creators.</p>
        <div className="auth-container">
          <h2>{isLogin ? 'Login' : 'Register'}</h2>
          <form onSubmit={handleAuthSubmit}>
            {!isLogin && (
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
          </form>
          <button onClick={handleAuthToggle} className="toggle-auth">
            {isLogin ? 'Need to Register?' : 'Already have an account? Login'}
          </button>
        </div>
        <div className="counter">
          <button onClick={handleClick}>Click count is {count}</button>
        </div>
        <div className="fetch-data">
          <button onClick={fetchData}>Fetch Data</button>
          {message && <p>{message}</p>}
        </div>
      </header>
    </div>
  );
}

export default App;
