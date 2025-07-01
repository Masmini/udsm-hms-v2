//src/components/providers/notification-provider.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert, AlertProps } from "@mui/material";

interface Notification {
  id: string;
  message: string;
  severity: AlertProps["severity"];
  duration?: number;
}

interface NotificationContextType {
  showNotification: (
    message: string,
    severity?: AlertProps["severity"],
    duration?: number
  ) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (
      message: string,
      severity: AlertProps["severity"] = "info",
      duration = 6000
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      const notification: Notification = { id, message, severity, duration };

      setNotifications((prev) => [...prev, notification]);

      // Auto remove after duration
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    },
    []
  );

  const showSuccess = useCallback(
    (message: string) => showNotification(message, "success"),
    [showNotification]
  );
  const showError = useCallback(
    (message: string) => showNotification(message, "error"),
    [showNotification]
  );
  const showWarning = useCallback(
    (message: string) => showNotification(message, "warning"),
    [showNotification]
  );
  const showInfo = useCallback(
    (message: string) => showNotification(message, "info"),
    [showNotification]
  );

  const handleClose = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const contextValue = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          style={{ top: 24 + index * 60 }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
}
