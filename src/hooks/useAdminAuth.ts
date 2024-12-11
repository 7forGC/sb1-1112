import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAdmin(token === 'admin-session-token');
    setLoading(false);
  }, []);

  const loginAsAdmin = async (email: string, password: string): Promise<boolean> => {
    if (email === 'admin@7forall.com' && password === 'admin123') {
      localStorage.setItem('adminToken', 'admin-session-token');
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    navigate('/login');
  };

  return {
    isAdmin,
    loading,
    loginAsAdmin,
    logoutAdmin
  };
};