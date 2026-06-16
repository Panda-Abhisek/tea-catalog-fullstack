import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Catalog from './pages/Catalog';
import TeaDetail from './pages/TeaDetail';
import Cart from './pages/Cart';
import Register from './pages/Register';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminTeaList from './pages/AdminTeaList';
import CreateTea from './pages/CreateTea';
import EditTea from './pages/EditTea';

function App() {
  return (
    <div className="min-h-screen flex flex-col ">
      <Navbar />
      <main className="grow container mx-auto px-4 py-8">
        <Routes>
          {/* Public E-commerce Routes */}
          <Route path="/" element={<Catalog />} />
          <Route path="/teas/:id" element={<TeaDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Management Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute redirectPath="/admin/login" />}>
            <Route path="/admin" element={<Navigate to="/admin/teas" replace />} />
            <Route path="/admin/teas" element={<AdminTeaList />} />
            <Route path="/admin/teas/create" element={<CreateTea />} />
            <Route path="/admin/teas/:id/edit" element={<EditTea />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;