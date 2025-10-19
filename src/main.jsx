import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './global.css';
import { AuthProvider } from './context/AuthContext';
import { PointsProvider } from './context/PointsContext';
import { MessagesProvider } from './context/MessagesContext';
import { HRProvider } from './context/HRContext';
import { NoticeProvider } from './context/NoticeContext';
import { ThemeProvider } from './context/ThemeContext';

import { seedReservations } from './seedReservations';
import { seedMessages } from './seedMessages';

// Seed data before app starts
seedReservations(); // ✅ Very important: runs before App starts
try {
  // Only seed messages if a user is logged in
  if (localStorage.getItem('travcoUser')) {
    seedMessages();
  }
} catch (error) {
  console.error('❌ Failed to seed messages:', error);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  // Removed StrictMode which can cause double rendering and refresh issues
  <ThemeProvider>
    <AuthProvider>
      <PointsProvider>
        <MessagesProvider>
          <HRProvider>
            <NoticeProvider>
              <App />
            </NoticeProvider>
          </HRProvider>
        </MessagesProvider>
      </PointsProvider>
    </AuthProvider>
  </ThemeProvider>
);
