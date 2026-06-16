import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { Edit, Trash2, Search } from 'lucide-react';

const TeaList = () => {
  const [teas, setTeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      // Build query string from filters, removing empty values
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/teas/?${queryParams.toString()}`);
      // Assuming the API returns a list directly or a paginated object with 'results'
      setTeas(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch teas. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTeas();
  }, [fetchTeas]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tea?')) return;

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-600">Tea Inventory</h1>
      </div>

      {/* Filters Section */}
      <div className="p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Global search..."
              value={filters.search}
              onChange={handleFilterChange}
              className="input-field pl-9"
            />
          </div>
          
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={filters.name}
            onChange={handleFilterChange}
            className="input-field"
          />
          
          <input
            type="text"
            name="origin"
            placeholder="Origin"
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

          <input
            type="number"
            name="price__gte"
            placeholder="Min Price"
            value={filters.price__gte}
            onChange={handleFilterChange}
            className="input-field"
            step="0.01"
          />
          
          <input
            type="number"
            name="price__lte"
            placeholder="Max Price"
            value={filters.price__lte}
            onChange={handleFilterChange}
            className="input-field"
            step="0.01"
          />

          <input
            type="number"
            name="stock__gte"
            placeholder="Min Stock"
            value={filters.stock__gte}
            onChange={handleFilterChange}
            className="input-field"
          />
          
          <input
            type="number"
            name="stock__lte"
            placeholder="Max Stock"
            value={filters.stock__lte}
            onChange={handleFilterChange}
            className="input-field"
          />
        </div>
        
        <div className="flex justify-end">
          <button onClick={clearFilters} className="btn-secondary text-sm">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {/* Tea List Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : teas.length === 0 ? (
        <div className="text-center py-12 rounded-lg border border-gray-200">
          <p className="text-gray-500">No teas found matching your criteria.</p>
        </div>
      ) : (
        <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className=" divide-y divide-gray-200">
                {teas.map((tea) => (
                  <tr key={tea.id} className="hover:bg-gray-50">
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
                        tea.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {tea.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={tea.description}>
                      {tea.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        to={`/teas/${tea.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(tea.id)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
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

export default TeaList;