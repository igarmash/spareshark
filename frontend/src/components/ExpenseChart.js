// components/ExpenseChart.js - Eine echte Chart-Komponente mit Recharts
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { getTransactionsByMonth, getAvailableYears } from '../utils/api';

// Array mit Farben für die Kategorien im Kreisdiagramm
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

function ExpenseChart({ transactions }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Lade verfügbare Jahre aus der API
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const years = await getAvailableYears();
        setAvailableYears(years);
        
        // Wenn das aktuelle Jahr nicht in den verfügbaren Jahren ist,
        // wähle das neueste verfügbare Jahr aus
        if (years.length > 0 && !years.includes(selectedYear)) {
          setSelectedYear(Math.max(...years));
        }
      } catch (err) {
        console.error('Fehler beim Laden der Jahre:', err);
        setError('Jahre konnten nicht geladen werden.');
      }
    };
    
    fetchYears();
  }, []);
  
  // Lade Transaktionen für den ausgewählten Monat und berechne Daten für die Diagramme
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        
        // Lade Transaktionen für den ausgewählten Monat
        const monthlyTransactions = await getTransactionsByMonth(selectedYear, selectedMonth);
        
        // Bereite Daten für das Balkendiagramm vor (Tägliche Ausgaben im Monat)
        const dailyExpenses = {};
        monthlyTransactions.forEach(transaction => {
          if (transaction.amount < 0) { // Nur Ausgaben
            const day = new Date(transaction.transactionDate).getDate();
            dailyExpenses[day] = (dailyExpenses[day] || 0) + Math.abs(transaction.amount);
          }
        });
        
        // Konvertiere in ein Array für das Diagramm
        const barChartData = Object.entries(dailyExpenses).map(([day, amount]) => ({
          day: parseInt(day),
          amount: parseFloat(amount.toFixed(2))
        })).sort((a, b) => a.day - b.day);
        
        setMonthlyData(barChartData);
        
        // Bereite Daten für das Kreisdiagramm vor (Ausgaben nach Kategorie)
        const categoryExpenses = {};
        monthlyTransactions.forEach(transaction => {
          if (transaction.amount < 0) { // Nur Ausgaben
            categoryExpenses[transaction.category] = (categoryExpenses[transaction.category] || 0) + 
              Math.abs(transaction.amount);
          }
        });
        
        // Konvertiere in ein Array für das Diagramm
        const pieChartData = Object.entries(categoryExpenses).map(([category, amount]) => ({
          name: category,
          value: parseFloat(amount.toFixed(2))
        })).sort((a, b) => b.value - a.value);
        
        setCategoryData(pieChartData);
        
        setLoading(false);
      } catch (err) {
        console.error('Fehler beim Laden der Monatsdaten:', err);
        setError('Monatsdaten konnten nicht geladen werden.');
        setLoading(false);
      }
    };
    
    fetchMonthlyData();
  }, [selectedYear, selectedMonth]);
  
  // Bereitstellung von Monats-Namen
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  
  // Formatierung für Tooltips
  const formatTooltip = (value) => [`${value} CHF`, ''];
  
  // Berechne Gesamtsumme der Ausgaben für den Monat
  const totalMonthlyExpenses = categoryData.reduce((sum, item) => sum + item.value, 0);
  
  if (loading) {
    return <div className="loading">Lädt...</div>;
  }
  
  return (
    <div className="expense-chart">
      <h2>Ausgabenanalyse</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="chart-filters">
        <div className="filter-group">
          <label htmlFor="year-select">Jahr:</label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="month-select">Monat:</label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {monthNames.map((name, index) => (
              <option key={index} value={index + 1}>{name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {monthlyData.length === 0 && categoryData.length === 0 ? (
        <div className="no-data">Keine Ausgaben im ausgewählten Zeitraum</div>
      ) : (
        <div className="chart-container">
          <h3>Tägliche Ausgaben im {monthNames[selectedMonth - 1]} {selectedYear}</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                label={{ value: 'Tag des Monats', position: 'insideBottom', offset: -5 }} 
              />
              <YAxis 
                label={{ value: 'Betrag (CHF)', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Bar dataKey="amount" name="Ausgaben" fill="#e74c3c" />
            </BarChart>
          </ResponsiveContainer>
          
          <h3 className="mt-4">Ausgaben nach Kategorie</h3>
          
          <div className="pie-chart-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '50%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} CHF`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-summary" style={{ width: '45%' }}>
              <h4>Ausgaben-Zusammenfassung</h4>
              <ul>
                {categoryData.map((item, index) => (
                  <li key={index} className="category-item">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div 
                        className="color-box" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="category-name">{item.name}</span>
                    </div>
                    <span>{item.value.toFixed(2)} CHF ({((item.value / totalMonthlyExpenses) * 100).toFixed(1)}%)</span>
                  </li>
                ))}
              </ul>
              
              <div className="category-total">
                <strong>Gesamtausgaben:</strong>
                <strong>{totalMonthlyExpenses.toFixed(2)} CHF</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseChart;