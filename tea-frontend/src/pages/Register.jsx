import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, ArrowLeft, Lock, Mail, User } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password1: '',
    password2: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific field error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Client-side validation
    if (formData.password1 !== formData.password2) {
      setErrors({ password2: ['Passwords do not match.'] });
      setIsLoading(false);
      return;
    }

    try {
      await register(
        formData.username,
        formData.password1,
        formData.password2
      );

      // If the backend returns tokens, the AuthContext auto-logs the user in.
      // If not, we redirect them to the login page.
      if (user) {
        navigate('/', { replace: true });
      } else {
        navigate('/admin/login', { 
          replace: true,
          state: { message: 'Registration successful! Please log in.' } 
        });
      }
    } catch (err) {
      if (err.response?.status === 400 && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ non_field_errors: ['Registration failed. Please try again.'] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mb-2">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
          <p className="text-sm text-gray-500">Join Tea Haven to start shopping</p>
        </div>
        
        {errors.non_field_errors && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            {errors.non_field_errors.join(', ')}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="input-field pl-10"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username[0]}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password1" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                id="password1"
                name="password1"
                type="password"
                required
                autoComplete="new-password"
                className="input-field pl-10"
                value={formData.password1}
                onChange={handleChange}
              />
            </div>
            {errors.password1 && <p className="text-xs text-red-600 mt-1">{errors.password1[0]}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                id="password2"
                name="password2"
                type="password"
                required
                autoComplete="new-password"
                className="input-field pl-10"
                value={formData.password2}
                onChange={handleChange}
              />
            </div>
            {errors.password2 && <p className="text-xs text-red-600 mt-1">{errors.password2[0]}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/admin/login" 
              className="font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
            >
              Log in
            </Link>
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-700 transition-colors mt-4"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;