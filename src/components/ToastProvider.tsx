'use client';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="light"
        icon={false}
        className="toast-container"
        toastClassName="toast-message"
        bodyClassName="toast-body"
        closeButton={false}
      />
      <style jsx global>{`
        .Toastify__toast {
          min-height: 48px;
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          font-family: inherit;
        }
        .Toastify__toast--success {
          background: #10b981;
          color: #ffffff;
        }
        .Toastify__toast--error {
          background: #ef4444;
          color: #ffffff;
        }
        .Toastify__toast--info {
          background: #3b82f6;
          color: #ffffff;
        }
        .Toastify__toast--warning {
          background: #f59e0b;
          color: #ffffff;
        }
        .Toastify__toast-body {
          margin: 0;
          padding: 0;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.5;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .Toastify__progress-bar {
          display: none;
        }
        .Toastify__close-button {
          display: none;
        }
      `}</style>
    </>
  );
}



