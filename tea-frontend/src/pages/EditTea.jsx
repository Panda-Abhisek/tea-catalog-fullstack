import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../utils/axios";

const EditTea = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    origin: "",
    price: "",
    stock: "",
    description: "",
    category: "Green",
    photo: null,
  });
  const [errors, setErrors] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const fetchTea = async () => {
      try {
        const response = await api.get(`/teas/${id}/`);
        const data = response.data;
        setFormData({
          name: data.name || "",
          origin: data.origin || "",
          price:
            data.price !== null && data.price !== undefined ? data.price : "",
          stock:
            data.stock !== null && data.stock !== undefined ? data.stock : "",
          description: data.description || "",
        });
      } catch (err) {
        setFetchError("Failed to load tea details. It may have been deleted.");
        console.error(err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchTea();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // const payload = {
      //   ...formData,
      //   price: parseFloat(formData.price),
      //   stock: parseInt(formData.stock, 10),
      // };

      // await api.put(`/teas/${id}/`, payload);

      const payload = new FormData();

      payload.append("name", formData.name);
      payload.append("origin", formData.origin);
      payload.append("price", formData.price);
      payload.append("stock", formData.stock);
      payload.append("description", formData.description);
      payload.append("category", formData.category);

      if (formData.photo) {
        payload.append("photo", formData.photo);
      }

      await api.put(`/teas/${id}/`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/admin/teas");
    } catch (err) {
      if (err.response?.status === 400 && err.response.data) {
        setErrors(err.response.data);
      } else {
        setErrors({
          non_field_errors: ["Failed to update tea. Please try again."],
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-red-600 mb-4">{fetchError}</p>
        <Link
          to="/admin/teas"
          className="btn-primary bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
        >
          Return to Inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-600">Edit Tea</h1>
          <p className="text-sm text-amber-100">
            Update the details for this inventory item.
          </p>
        </div>
        <Link to="/admin/teas" className="btn-secondary bg-amber-100">
          Cancel
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-amber-100/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-200 space-y-6"
      >
        {errors.non_field_errors && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            {errors.non_field_errors.join(", ")}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
                errors.name
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name[0]}</p>
            )}
          </div>

          {/* Origin */}
          <div className="space-y-1">
            <label
              htmlFor="origin"
              className="block text-sm font-medium text-gray-700"
            >
              Origin <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="origin"
              name="origin"
              required
              value={formData.origin}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
                errors.origin
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
              }`}
            />
            {errors.origin && (
              <p className="text-xs text-red-600">{errors.origin[0]}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
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
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
                errors.price
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
              }`}
            />
            {errors.price && (
              <p className="text-xs text-red-600">{errors.price[0]}</p>
            )}
          </div>

          {/* Stock */}
          <div className="space-y-1">
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700"
            >
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
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
                errors.stock
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
              }`}
            />
            {errors.stock && (
              <p className="text-xs text-red-600">{errors.stock[0]}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
              errors.description
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
            }`}
          />
          {errors.description && (
            <p className="text-xs text-red-600">{errors.description[0]}</p>
          )}
        </div>

        <div className="flex justify-between">
          {/* Category */}
          <div className="space-y-1 items-center gap-3 w-full md:w-auto">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="flex md:flex-none border border-gray-300 text-emerald-600 px-24 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <option value="Green">Green</option>
              <option value="Black">Black</option>
              <option value="Herbal">Herbal</option>
            </select>
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
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTea;
