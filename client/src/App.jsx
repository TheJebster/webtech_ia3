import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';
import AppNavbar from './components/AppNavbar';
import ApiInspector from './components/ApiInspector';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import Profile from './pages/Profile';
import EquipmentManagement from './pages/admin/EquipmentManagement';
import UserManagement from './pages/admin/UserManagement';
import RentalManagement from './pages/admin/RentalManagement';
import EquipmentCatalog from './pages/user/EquipmentCatalog';
import EquipmentDetail from './pages/user/EquipmentDetail';
import RentalHistory from './pages/user/RentalHistory';

// The dashboard pulls in the charting library; load it only when an admin
// visits, keeping the initial bundle small.
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));

const PageFallback = () => (
  <Container className="text-center mt-5">
    <Spinner animation="border" />
  </Container>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppNavbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected - any authenticated user */}
          <Route path="/equipment" element={<ProtectedRoute><EquipmentCatalog /></ProtectedRoute>} />
          <Route path="/equipment/:id" element={<ProtectedRoute><EquipmentDetail /></ProtectedRoute>} />
          <Route path="/my-rentals" element={<ProtectedRoute><RentalHistory /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

          {/* Admin only */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <Suspense fallback={<PageFallback />}>
                  <Dashboard />
                </Suspense>
              </AdminRoute>
            }
          />
          <Route path="/admin/equipment" element={<AdminRoute><EquipmentManagement /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="/admin/rentals" element={<AdminRoute><RentalManagement /></AdminRoute>} />
        </Routes>
        <ApiInspector />
      </Router>
    </AuthProvider>
  );
}

export default App;
