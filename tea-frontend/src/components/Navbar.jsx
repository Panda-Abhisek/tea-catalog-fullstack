import { Link, useNavigate, NavLink } from "react-router-dom";
import { ShoppingCart, User, LogOut, Package, Shield } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const cartCount = cart?.total_items || 0;
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link
            to="/"
            className="text-2xl font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-2 transition-colors"
          >
            <Package className="h-6 w-6" />
            <span className="hidden sm:inline">Tea Haven</span>
            <span className="sm:hidden">TH</span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-amber-100 hover:text-emerald-700 font-medium transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/cart"
              className="text-amber-100 hover:text-emerald-700 font-medium transition-colors flex items-center gap-1"
            >
              <ShoppingCart className="h-5 w-5" />
              Cart
              {cartCount > 0 && (
                <span className="bg-emerald-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-1">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/orders" className="text-amber-100 hover:text-emerald-700 font-medium transition-colors flex items-center gap-1">My Orders</Link>
          </div>

          {/* Auth / Admin Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {/* User Info (Hidden on very small screens) */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                  <User className="h-4 w-4 text-emerald-700" />
                  <span className="text-sm font-medium text-emerald-600 max-w-30 truncate">
                    {user.username || "User"}
                  </span>
                </div>

                {user.role === "Admin" ? (
                  <>
                    <NavLink
                      to="/admin/teas"
                      className={({ isActive }) =>
                        `text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-emerald-600 text-white"
                            : "text-amber-100 hover:text-emerald-700 hover:bg-gray-50"
                        }`
                      }
                      title="Admin Dashboard"
                    >
                      <Shield className="h-4 w-4" />
                      <span className="hidden sm:inline">Inventory</span>
                    </NavLink>

                    <NavLink
                      to="/admin/dashboard"
                      className={({ isActive }) =>
                        `text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-emerald-600 text-white"
                            : "text-amber-100 hover:text-emerald-700 hover:bg-gray-50"
                        }`
                      }
                    >
                      Dashboard
                    </NavLink>

                    <NavLink
                      to="/admin/orders"
                      className={({ isActive }) =>
                        `text-sm font-medium flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-emerald-600 text-white"
                            : "text-amber-100 hover:text-emerald-700 hover:bg-gray-50"
                        }`
                      }
                    >
                      Orders
                    </NavLink>

                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleLogout}
                      className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </>
                )}
              </>
            ) : (
              <Link
                to="/admin/login"
                className="text-sm font-medium text-amber-100 bg-emerald-600 hover:text-emerald-700 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            {/* Mobile Cart Icon */}
            <Link
              to="/cart"
              className="md:hidden relative p-2 text-amber-100 hover:text-emerald-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
