import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SiteFooter from './components/SiteFooter';
import './App.css';
import Landing from './pages/Landing';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const AppRoutes = () => {
    const location = useLocation();
    const state = location.state;

    const isHome = (state?.backgroundLocation?.pathname || location.pathname) === '/';

    return (
      <>
        <Routes location={state?.backgroundLocation || location}>
          <Route path="/" element={<Landing />} />
        </Routes>
        {isHome && <SiteFooter />}
      </>
    );
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#f8fff6]">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1f2937',
                color: '#fff',
              },
            }}
          />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;


