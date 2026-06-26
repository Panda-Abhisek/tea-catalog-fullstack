import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { getOrder } from "../services/orderServices";
import { ArrowLeft, ShoppingBag, CheckCircle } from "lucide-react";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const OrderDetails = () => {
  const { id } = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrder(id);
        console.log(data);
        
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-amber-100">Order not found.</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {location.state?.success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
          <CheckCircle className="text-green-600 h-8 w-8" />

          <div>
            <h2 className="font-bold text-green-800">
              Order Placed Successfully
            </h2>

            <p className="text-green-700 text-sm">
              Thank you for shopping with us.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate("/orders")}
        className="flex items-center gap-2 text-amber-100 hover:text-white"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Orders
      </button>

      <div className="backdrop-blur-sm bg-amber-100 rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <img className="h-40 w-40 rounded" src={order.items[0].tea_photo} alt={order.items[0].tea_name} />
          <div>
            <h1 className="text-3xl font-bold">Order #{order.id}</h1>

            <p className="text-gray-600 mt-2">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          <span
            className={`px-4 py-2 rounded-full font-semibold ${statusColors[order.status]}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="backdrop-blur-sm bg-amber-100 rounded-xl border border-gray-200">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-5 border-b last:border-b-0"
          >
            <div>
              <h3 className="font-semibold text-lg">{item.tea_name}</h3>

              <p className="text-gray-600">
                ₹{Number(item.price_at_purchase).toFixed(2)} × {item.quantity}
              </p>
            </div>

            <div className="text-xl font-bold text-emerald-700">
              ₹{(Number(item.price_at_purchase) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className="backdrop-blur-sm bg-amber-100 rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between text-2xl font-bold">
          <span>Total</span>

          <span className="text-emerald-700">
            ₹{Number(order.total_amount).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <Link to="/" className="btn-primary">
          Continue Shopping
        </Link>

        <Link
          to="/orders"
          className="px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50"
        >
          My Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderDetails;
