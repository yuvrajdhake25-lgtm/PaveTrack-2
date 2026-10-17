import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Silently fetch fresh user profile if token is valid
        import('../api/complaints').then(({ getMe }) => {
          getMe().then(freshUser => {
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem('user', JSON.stringify(freshUser));
            }
          }).catch(() => {});
        });
      } catch (e) {
        console.error("Error parsing user from localStorage");
      }
    }
    setLoading(false);
  }, []);

  const loginContext = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const refreshUser = async () => {
    try {
      const { getMe } = await import('../api/complaints');
      const freshUser = await getMe();
      if (freshUser) {
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        return freshUser;
      }
    } catch (e) {
      console.error("Failed to refresh user:", e);
    }
    return user;
  };

  const logoutContext = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, loginContext, logoutContext, logout: logoutContext, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

