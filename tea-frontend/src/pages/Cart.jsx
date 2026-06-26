import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
    updateCartItem,
    removeCartItem,
    clearCart as clearCartAPI,
} from "../services/cartService";
import { createPaymentOrder, checkout, verifyPayment } from '../services/orderServices';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle } from 'lucide-react';

const Cart = () => {
    const { cart, loading, fetchCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const handleUpdateQuantity = async (itemId, quantity) => {
        if (quantity < 1) {
            await handleRemoveItem(itemId);
            return;
        }
        try {
            await updateCartItem(itemId, quantity);
            fetchCart();
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await removeCartItem(itemId);
            await fetchCart()
        } catch (error) {
            console.error(error);
        }
    };

    const handleClearCart = async () => {
        try {
            await clearCartAPI();
            await fetchCart()
        } catch (error) {
            console.error(error);
        }
    };

    const handleCheckout = async () => {
        if (!user) {
            setShowLoginPrompt(true);
            setTimeout(() => setShowLoginPrompt(false), 3000);
            return;
        }

        setIsCheckingOut(true);

        try {
            const order = await checkout();
            console.log("Order: from cart.jsx at handle checkout ", order)
            const payment = await createPaymentOrder(order.id);
            openRazorpay(payment, order.id);
        } catch (err) {
            console.error(err);
        } finally {
            setIsCheckingOut(false);
        }
    };

    const openRazorpay = async (payment,orderId) => {
        const options = {

            key: payment.key,
            amount: payment.amount,
            currency: payment.currency,
            name: "Tea Catalog",
            description: "Tea Purchase",
            order_id: payment.order_id,

            handler: async function (response) {
                try {
                    await verifyPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });
                    await fetchCart();
                    navigate(
                        `/orders/${orderId}`,
                        {
                            state: {
                                success: true,
                            },
                        }
                    );
                } catch (err) {
                    console.error(err);
                    alert("Payment verification failed.");
                }
            },
            theme: {
                color: "#059669",
            },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    };

    if (checkoutSuccess) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
                <p className="text-gray-500 mb-6">Thank you for your purchase. Redirecting you back to the shop...</p>
            </div>
        );
    }

    if (
        !loading &&
        (!cart || cart.items.length === 0)
    ) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-amber-100 mb-2">Your cart is empty</h2>
                <p className="text-gray-200 mb-6">Looks like you haven't added any teas to your cart yet.</p>
                <Link to="/" className="btn-primary inline-flex items-center gap-2">
                    Start Shopping
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Login Prompt Toast */}
            {showLoginPrompt && (
                <div className="fixed top-20 right-4 z-50 bg-white border border-amber-200 text-amber-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-down">
                    <Lock className="h-5 w-5 text-amber-600" />
                    <div>
                        <p className="font-medium">Login required</p>
                        <p className="text-sm text-amber-700">Please log in to complete your checkout.</p>
                    </div>
                    <Link to="/admin/login" className="ml-4 text-sm font-semibold text-emerald-700 hover:text-emerald-900 underline">
                        Log in
                    </Link>
                </div>
            )}

            <h1 className="text-3xl font-bold text-amber-100 mb-8">Shopping Cart</h1>

            {/* Guest Checkout Warning Banner */}
            {!user && (
                <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-amber-600 shrink-0" />
                        <p className="text-sm">
                            You are browsing as a guest. Please <Link to="/admin/login" className="font-semibold underline hover:text-amber-900">log in</Link> to complete your purchase.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-4">
                    {cart?.items?.map((item) => (
                        <div
                            key={item.id}
                            className="backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                        >
                            {/* Item Image Placeholder */}
                            <div className="w-full sm:w-24 h-24 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                                <span className="text-2xl">🍵</span>
                            </div>

                            {/* Item Details */}
                            <div className="grow min-w-0">
                                <Link to={`/teas/${item.tea}`} className="text-lg font-semibold text-gray-900 hover:text-emerald-700 truncate block">
                                    {item.tea_name}
                                </Link>
                                <p className="text-sm text-gray-200">Tea Product</p>
                                <p className="text-sm font-medium text-emerald-700 mt-1">
                                    &#x20B9;{Number(item.tea_price).toFixed(2)} each
                                </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                                    <button
                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-l-lg transition-colors"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-10 text-center text-sm font-medium text-gray-900">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock}
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    aria-label="Remove item"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="backdrop-blur-sm p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                        <h2 className="text-xl font-bold text-amber-100 mb-6">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-200">
                                <span>Subtotal</span>
                                <span>₹{Number(cart?.total_price || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-200">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-bold text-gray-100">
                                <span>Total</span>
                                <span>₹{Number(
                                    cart?.total_price || 0
                                ).toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isCheckingOut || !user}
                            className={`w-full py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${!user
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isCheckingOut
                                    ? 'bg-emerald-400 text-white cursor-wait'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'
                                }`}
                        >
                            {isCheckingOut ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : !user ? (
                                <>
                                    <Lock className="h-5 w-5" />
                                    Login to Checkout
                                </>
                            ) : (
                                <>
                                    Proceed to Checkout
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>

                        {/* <p className="text-xs text-gray-200 text-center mt-4">
                            Secure checkout powered by mock payment processing.
                        </p> */}

                        {!user && (
                            <p className="text-xs text-center text-amber-700 mt-4 bg-amber-50 py-2 rounded-lg">
                                Authentication is required to complete your order.
                            </p>
                        )}

                        {user && (
                            <p className="text-xs text-gray-200 text-center mt-4">
                                Secure checkout powered by mock payment processing.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;