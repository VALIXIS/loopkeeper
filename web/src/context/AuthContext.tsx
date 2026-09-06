import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Employee } from '../types';
import { MOCK_EMPLOYEES } from '../services/mockData';
import { api } from '../services/api';

import { LoginModal } from '../components/common/LoginModal';

interface AuthContextType {
  currentUser: Employee;
  employees: Employee[];
  switchUser: (employeeId: string) => void;
  isManager: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employeesList, setEmployeesList] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Employee>(() => {
    const saved = localStorage.getItem('loopkeeper_user_id');
    if (saved) {
      const found = MOCK_EMPLOYEES.find(e => e.id === saved);
      if (found) return found;
    }
    return MOCK_EMPLOYEES[0];
  });

  useEffect(() => {
    let mounted = true;
    api.getEmployees().then(liveList => {
      if (mounted && liveList && liveList.length > 0) {
        setEmployeesList(liveList);
      }
    }).catch(err => {
      console.warn('AuthContext failed to fetch live employees:', err);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem('loopkeeper_user_id', currentUser.id);
  }, [currentUser]);

  const switchUser = (employeeId: string) => {
    const found = employeesList.find(e => e.id === employeeId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const isManager = currentUser.is_manager || currentUser.role?.toLowerCase().includes('manager') || currentUser.name === 'Subhash' || currentUser.name === 'Jyothsna';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        employees: employeesList,
        switchUser,
        isManager,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal
      }}
    >
      {children}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
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
