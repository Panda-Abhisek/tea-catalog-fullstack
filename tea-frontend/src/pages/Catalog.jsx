import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Search, SlidersHorizontal, ShoppingCart, Leaf, Lock } from 'lucide-react';

const Catalog = () => {
    const [teas, setTeas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [addingToCart, setAddingToCart] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const [filters, setFilters] = useState({
        search: '',
        origin: '',
        price__lte: '',
        ordering: '-created_at',
    });

    const [showFilters, setShowFilters] = useState(false);

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
            setError('Failed to load teas. Please try again later.');
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

    const handleAddToCart = (e, tea) => {
        e.preventDefault();

        if (!user) {
            setShowLoginPrompt(true);
            setTimeout(() => setShowLoginPrompt(false), 3000);
            return;
        }

        if (tea.stock <= 0) return;

        setAddingToCart(tea.id);
        addToCart(tea);
        setTimeout(() => setAddingToCart(null), 1000);
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            origin: '',
            price__lte: '',
            ordering: '-created_at',
        });
    };

    return (
        <div className="space-y-8 relative">
            {/* Login Prompt Toast */}
            {showLoginPrompt && (
                <div className="fixed top-20 right-4 z-50 bg-amber-100 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-down">
                    <Lock className="h-5 w-5 text-amber-600" />
                    <div>
                        <p className="font-medium">Login required</p>
                        <p className="text-sm text-amber-700">Please log in to add items to your cart.</p>
                    </div>
                </div>
            )}

            {/* Hero / Header */}
            <div className="backdrop-blur-sm bg-amber-100/70 flex flex-col justify-center items-center space-y-2 py-8 rounded-2xl border border-emerald-100">
                <h1 className="text-3xl md:text-4xl font-bold text-emerald-900">Discover Our Premium Teas</h1>
                <p className="text-emerald-700 max-w-2xl mx-auto">
                    Sourced from the finest gardens around the world, our collection offers a perfect cup for every moment.
                </p>
                {!user && (
                    <p className="text-sm text-amber-700 bg-amber-50 inline-block px-3 py-1 rounded-full mt-2">
                        Please log in to purchase teas
                    </p>
                )}
            </div>

            {/* Filters Bar */}
            <div className="bg-amber-100/70 p-4 rounded-xl shadow-sm border border-gray-200 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-emerald-600" />
                        <input
                            type="text"
                            name="search"
                            placeholder="Search teas..."
                            value={filters.search}
                            onChange={handleFilterChange}
                            className="w-full pl-10 pr-4 py-2 text-emerald-600 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden btn-secondary flex items-center gap-2"
                        >
                            <SlidersHorizontal className="h-4 w-4" /> Filters
                        </button>

                        <select
                            name="ordering"
                            value={filters.ordering}
                            onChange={handleFilterChange}
                            className="flex-1 md:flex-none text-emerald-600 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                            <option value="created_at">Newest Arrivals</option>
                            <option value="price">Price: Low to High</option>
                            <option value="-price">Price: High to Low</option>
                            <option value="name">Name: A to Z</option>
                        </select>
                    </div>
                </div>

                {/* Expanded Filters */}
                <div className={`mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${showFilters ? 'block' : 'hidden'}`}>
                    <input
                        type="text"
                        name="origin"
                        placeholder="Filter by Origin (e.g., Japan, India)"
                        value={filters.origin}
                        onChange={handleFilterChange}
                        className="px-4 py-2 border text-emerald-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                        type="number"
                        name="price__lte"
                        placeholder="Max Price ($)"
                        value={filters.price__lte}
                        onChange={handleFilterChange}
                        className="px-4 py-2 border text-emerald-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        min="0"
                        step="0.01"
                    />
                    <button onClick={clearFilters} className="text-sm cursor-pointer text-emerald-700 hover:text-emerald-900 font-medium underline decoration-emerald-300 underline-offset-4">
                        Clear all filters
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg text-center">
                    {error}
                </div>
            )}

            {/* Product Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                </div>
            ) : teas.length === 0 ? (
                <div className="text-center py-16  rounded-xl border border-gray-200">
                    <Leaf className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No teas found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {teas.map((tea) => (
                        <Link
                            key={tea.id}
                            to={`/teas/${tea.id}`}
                            className="group backdrop-blur-sm bg-amber-100 rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                        >
                            {/* Product Image Placeholder */}
                            <div className="h-48 bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                {/* <Leaf className="h-16 w-16 text-emerald-300 group-hover:text-emerald-500 transition-colors" /> */}
                                {tea.photo ? (
                                    <img src={tea.photo} alt={tea.name} className="h-full object-cover" />
                                ) : (
                                    <Leaf className="h-16 w-16 text-emerald-300 group-hover:text-emerald-500 transition-colors" />
                                )}
                            </div>

                            <div className="p-5 flex flex-col grow">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-wide">
                                        {tea.origin || 'Unknown Origin'}
                                    </span>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${tea.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {tea.stock > 0 ? `${tea.stock} in stock` : 'Out of stock'}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                                    {tea.name}
                                </h3>

                                <p className="text-sm text-gray-500 line-clamp-2 mb-4 grow">
                                    {tea.description || 'No description available.'}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                    <span className="text-xl font-bold text-gray-900">
                                        ${Number(tea.price).toFixed(2)}
                                    </span>

                                    <button
                                        onClick={(e) => handleAddToCart(e, tea)}
                                        disabled={tea.stock <= 0 || addingToCart === tea.id}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tea.stock <= 0
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : addingToCart === tea.id
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                                            }`}
                                    >
                                        {addingToCart === tea.id ? (
                                            'Added!'
                                        ) : (
                                            <>
                                                <ShoppingCart className="h-4 w-4" />
                                                Add
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Catalog;