// components/Auth/RegisterForm.js (updated to use the API)
import React, { useState } from 'react';

function RegisterForm({ onRegister, switchToLogin }) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validierungen
    if (!form.username || !form.email || !form.password) {
      setError('Bitte füllen Sie alle Felder aus.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (form.password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    try {
      // Create registration data (excluding confirmPassword)
      const registrationData = {
        username: form.username,
        email: form.email,
        password: form.password
      };
      
      // Registrierung durchführen
      await onRegister(registrationData);
    } catch (error) {
      setError('Registrierung fehlgeschlagen. Möglicherweise existiert dieser Benutzer bereits.');
    }
  };

  return (
    <div className="auth-form">
      <h2>Konto erstellen</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Benutzername</label>
          <input
            type="text"
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">E-Mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Passwort</label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Passwort bestätigen</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" className="btn-primary">Registrieren</button>
      </form>
      
      <p className="auth-switch">
        Bereits ein Konto? <button onClick={switchToLogin}>Einloggen</button>
      </p>
    </div>
  );
}

export default RegisterForm;