import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Error Page
import NotFound404 from './pages/NotFound404'

// Public Pages
import Catalog from './pages/Catalog';
import TeaDetail from './pages/TeaDetail';
import Cart from './pages/Cart';
import Register from './pages/Register';

// Admin Pages
import Login from './pages/Login';
import AdminTeaList from './pages/AdminTeaList';
import CreateTea from './pages/CreateTea';
import EditTea from './pages/EditTea';
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from './components/AdminRoute';

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
          <Route path="/admin/login" element={<Login />} />
          <Route element={<ProtectedRoute redirectPath="/admin/login" />}>
            <Route path="/admin" element={<Navigate to="/admin/teas" replace />} />
            <Route path="/admin/teas" element={<AdminRoute><AdminTeaList /></AdminRoute>} />
            <Route path="/admin/teas/create" element={<CreateTea />} />
            <Route path="/admin/teas/:id/edit" element={<EditTea />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>}/>
          </Route>

          <Route path='/404' element={<NotFound404 />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;