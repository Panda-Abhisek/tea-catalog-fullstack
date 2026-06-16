import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';

const CreateTea = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    price: '',
    stock: '',
    description: '',
    photo: null,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific field error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // const payload = {
      //   ...formData,
      //   price: parseFloat(formData.price),
      //   stock: parseInt(formData.stock, 10),
      // };

      // await api.post('/teas/', payload);

      const payload = new FormData();

      payload.append("name", formData.name);
      payload.append("origin", formData.origin);
      payload.append("price", formData.price);
      payload.append("stock", formData.stock);
      payload.append("description", formData.description);

      if (formData.photo) {
        payload.append("photo", formData.photo);
      }

      await api.post(
        "/teas/",
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      navigate('/admin/teas');
    } catch (err) {
      if (err.response?.status === 400 && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ non_field_errors: ['Failed to create tea. Please try again.'] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-600">Add New Tea</h1>
          <p className="text-sm text-amber-100">Enter the details for the new inventory item.</p>
        </div>
        <Link to="/admin/teas" className="btn-secondary bg-amber-100">
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-amber-100/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        {errors.non_field_errors && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            {errors.non_field_errors.join(', ')}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="space-y-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.name
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name[0]}</p>}
          </div>

          {/* Origin */}
          <div className="space-y-1">
            <label htmlFor="origin" className="block text-sm font-medium text-gray-700">
              Origin <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="origin"
              name="origin"
              required
              value={formData.origin}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.origin
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
            />
            {errors.origin && <p className="text-xs text-red-600">{errors.origin[0]}</p>}
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.price
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
            />
            {errors.price && <p className="text-xs text-red-600">{errors.price[0]}</p>}
          </div>

          {/* Stock */}
          <div className="space-y-1">
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
              Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              required
              min="0"
              step="1"
              value={formData.stock}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.stock
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
            />
            {errors.stock && <p className="text-xs text-red-600">{errors.stock[0]}</p>}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.description
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
          />
          {errors.description && <p className="text-xs text-red-600">{errors.description[0]}</p>}
        </div>

        {/* Photo */}
        <div className="space-y-1">
          <label
            htmlFor="photo"
            className="block text-sm font-medium text-gray-700"
          >
            Photo
          </label>

          <input
            type="file"
            id="photo"
            accept="image/*"
            onChange={(e) =>
              setFormData({
                ...formData,
                photo: e.target.files[0],
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
          >
            {isLoading ? 'Creating...' : 'Create Tea'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTea;