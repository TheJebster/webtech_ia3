import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppNavbar from './components/AppNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/admin/Dashboard';
import EquipmentManagement from './pages/admin/EquipmentManagement';
import UserManagement from './pages/admin/UserManagement';
import RentalManagement from './pages/admin/RentalManagement';
import EquipmentCatalog from './pages/user/EquipmentCatalog';
import EquipmentDetail from './pages/user/EquipmentDetail';
import RentalHistory from './pages/user/RentalHistory';

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
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/equipment" element={<AdminRoute><EquipmentManagement /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="/admin/rentals" element={<AdminRoute><RentalManagement /></AdminRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
