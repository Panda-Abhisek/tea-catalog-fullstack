import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { Edit, Trash2, Search, Plus, SlidersHorizontal } from 'lucide-react';

const AdminTeaList = () => {
  const [teas, setTeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: '',
    name: '',
    origin: '',
    price__gte: '',
    price__lte: '',
    stock__gte: '',
    stock__lte: '',
    ordering: '',
  });

  const fetchTeas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/teas/?${queryParams.toString()}`);
      setTeas(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch inventory. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeas();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchTeas]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this tea from the inventory?')) return;

    try {
      await api.delete(`/teas/${id}/`);
      setTeas((prev) => prev.filter((tea) => tea.id !== id));
    } catch (err) {
      alert('Failed to delete tea. Please try again.');
      console.error(err);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      name: '',
      origin: '',
      price__gte: '',
      price__lte: '',
      stock__gte: '',
      stock__lte: '',
      ordering: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-600">Inventory Management</h1>
          <p className="text-sm text-amber-100">Manage your tea catalog, pricing, and stock levels.</p>
        </div>
        <Link to="/admin/teas/create" className="btn-primary bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Tea
        </Link>
      </div>

      {/* Filters Section */}
      <div className="bg-amber-100 p-4 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-emerald-400" />
            <input
              type="text"
              name="search"
              placeholder="Global search..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full md:w-auto btn-secondary flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" /> 
            {showFilters ? 'Hide Filters' : 'Advanced Filters'}
          </button>
        </div>
        
        {/* Advanced Filters */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100 transition-all ${showFilters ? 'block' : 'hidden'}`}>
          <input
            type="text"
            name="name"
            placeholder="Exact Name"
            value={filters.name}
            onChange={handleFilterChange}
            className="input-field"
          />
          <input
            type="text"
            name="origin"
            placeholder="Exact Origin"
            value={filters.origin}
            onChange={handleFilterChange}
            className="input-field"
          />
          <select
            name="ordering"
            value={filters.ordering}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">Sort By...</option>
            <option value="name">Name (A-Z)</option>
            <option value="-name">Name (Z-A)</option>
            <option value="price">Price (Low to High)</option>
            <option value="-price">Price (High to Low)</option>
            <option value="stock">Stock (Low to High)</option>
            <option value="-stock">Stock (High to Low)</option>
            <option value="-created_at">Newest First</option>
          </select>
          <div className="flex items-center gap-2">
             <input
              type="number"
              name="price__gte"
              placeholder="Min Price"
              value={filters.price__gte}
              onChange={handleFilterChange}
              className="input-field"
              step="0.01"
            />
            <span className="text-gray-400">to</span>
            <input
              type="number"
              name="price__lte"
              placeholder="Max Price"
              value={filters.price__lte}
              onChange={handleFilterChange}
              className="input-field"
              step="0.01"
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-2">
             <input
              type="number"
              name="stock__gte"
              placeholder="Min Stock"
              value={filters.stock__gte}
              onChange={handleFilterChange}
              className="input-field"
            />
            <span className="text-gray-400">to</span>
            <input
              type="number"
              name="stock__lte"
              placeholder="Max Stock"
              value={filters.stock__lte}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-2 flex justify-end">
            <button onClick={clearFilters} className="text-sm text-emerald-700 hover:text-emerald-900 font-medium underline decoration-emerald-300 underline-offset-4">
              Clear all filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Inventory Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : teas.length === 0 ? (
        <div className="text-center py-12 bg-amber-100 rounded-xl border border-gray-200">
          <p className="text-emerald-600">No teas found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-amber-100 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-amber-100 divide-y divide-gray-200">
                {teas.map((tea) => (
                  <tr key={tea.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tea.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tea.origin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Number(tea.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tea.stock > 10 ? 'bg-green-100 text-green-800' : tea.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {tea.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={tea.description}>
                      {tea.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link
                        to={`/admin/teas/${tea.id}/edit`}
                        className="text-emerald-600 hover:text-emerald-900 inline-flex items-center transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(tea.id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeaList;