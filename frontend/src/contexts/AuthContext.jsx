import { createContext, useContext } from 'react';


const AuthContext = createContext({
  isAuthenticated: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const isAuthenticated = () => {
    return true;
  };

  const value = {
    isAuthenticated,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;