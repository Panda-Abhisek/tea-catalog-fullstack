import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Leaf, ShoppingCart, Check, AlertCircle, Lock } from 'lucide-react';

const TeaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [tea, setTea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const fetchTea = async () => {
      try {
        const response = await api.get(`/teas/${id}/`);
        setTea(response.data);
        setQuantity(1); // Reset quantity on new tea load
      } catch (err) {
        setError('Failed to load tea details. It may have been removed.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTea();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    if (!tea || tea.stock <= 0) return;
    
    setIsAdding(true);
    for (let i = 0; i < quantity; i++) {
      addToCart(tea);
    }
    
    setTimeout(() => setIsAdding(false), 1000);
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= (tea?.stock || 1)) {
      setQuantity(val);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !tea) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 bg-white rounded-xl border border-gray-200">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Tea Not Found</h2>
        <p className="text-gray-500 mb-6">{error || 'The requested tea does not exist.'}</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = tea.stock <= 0;

  return (
    <div className="max-w-6xl mx-auto relative">
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

      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 text-emerald-400 hover:text-emerald-700 flex items-center gap-2 font-medium transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Catalog
      </button>

      <div className="backdrop-blur-sm bg-amber-100/70 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Placeholder */}
          <div className="h-64 md:h-full bg-emerald-50 flex items-center justify-center p-8">
            <Leaf className="h-32 w-32 text-emerald-200" />
            {tea.photo && (
              <img 
                src={tea.photo}
                alt={tea.name}
                className="w-full h-full object-fit-cover rounded-lg shadow-sm border border-gray-200"
              />
            )}
          </div>

          {/* Product Details */}
          <div className="p-8 md:p-12 flex flex-col">
            <div className="mb-4">
              <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wide mb-3">
                {tea.origin || 'Unknown Origin'}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-2">
                {tea.name}
              </h1>
              <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
                <span className={`flex items-center gap-1 font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                  {isOutOfStock ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  {isOutOfStock ? 'Out of Stock' : `${tea.stock} units available`}
                </span>
              </div>
            </div>

            <div className="text-3xl font-bold text-emerald-700 mb-6">
              ${Number(tea.price).toFixed(2)}
            </div>

            <div className="prose prose-emerald mb-8 grow">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {tea.description || 'No description available for this tea.'}
              </p>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-4">
              {!isOutOfStock && (
                <div className="flex items-center gap-4">
                  <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Quantity:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-l-lg"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-16 text-center border-x border-gray-300 py-2 focus:outline-none"
                      min="1"
                      max={tea.stock}
                    />
                    <button 
                      onClick={() => setQuantity(q => Math.min(tea.stock, q + 1))}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-r-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-base font-semibold transition-all ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isAdding
                    ? 'bg-green-600 text-white'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
                }`}
              >
                {isAdding ? (
                  <>
                    <Check className="h-5 w-5" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    {isOutOfStock ? 'Out of Stock' : `Add to Cart - $${(tea.price * quantity).toFixed(2)}`}
                  </>
                )}
              </button>
              
              {!user && !isOutOfStock && (
                <p className="text-xs text-center text-amber-700 bg-amber-50 py-2 rounded-lg">
                  <Lock className="h-3 w-3 inline mr-1 mb-0.5" />
                  You must be logged in to add items to your cart.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeaDetail;