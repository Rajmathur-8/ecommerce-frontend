'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store/store';
import { AppProvider } from '../contexts/AppContext';
import { ToastManager } from './Toast';
import { AuthGuard } from './AuthGuard';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppProvider>
          <AuthGuard>
            <ToastManager>
              {children}
            </ToastManager>
          </AuthGuard>
        </AppProvider>
      </PersistGate>
    </Provider>
  );
} 