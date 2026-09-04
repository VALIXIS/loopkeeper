import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Employee } from '../types';
import { MOCK_EMPLOYEES } from '../services/mockData';

interface AuthContextType {
  currentUser: Employee;
  employees: Employee[];
  switchUser: (employeeId: string) => void;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Employee>(() => {
    const saved = localStorage.getItem('loopkeeper_user_id');
    if (saved) {
      const found = MOCK_EMPLOYEES.find(e => e.id === saved);
      if (found) return found;
    }
    return MOCK_EMPLOYEES[0];
  });

  useEffect(() => {
    localStorage.setItem('loopkeeper_user_id', currentUser.id);
  }, [currentUser]);

  const switchUser = (employeeId: string) => {
    const found = MOCK_EMPLOYEES.find(e => e.id === employeeId);
    if (found) {
      setCurrentUser(found);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        employees: MOCK_EMPLOYEES,
        switchUser,
        isManager: currentUser.is_manager
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
