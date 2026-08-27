import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { PermissionProvider } from './context/PermissionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './views/LoginPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <ThemeProvider>
      <ModalProvider>
        <PermissionProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </PermissionProvider>
      </ModalProvider>
    </ThemeProvider>
  );
}
