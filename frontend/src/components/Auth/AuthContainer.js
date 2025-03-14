
// components/Auth/AuthContainer.js
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

function AuthContainer({ onLogin, onRegister }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' oder 'register'
  
  const switchToLogin = () => setAuthMode('login');
  const switchToRegister = () => setAuthMode('register');
  
  return (
    <div className="auth-container">
      {authMode === 'login' ? (
        <LoginForm 
          onLogin={onLogin} 
          switchToRegister={switchToRegister} 
        />
      ) : (
        <RegisterForm 
          onRegister={onRegister} 
          switchToLogin={switchToLogin} 
        />
      )}
    </div>
  );
}

export default AuthContainer;