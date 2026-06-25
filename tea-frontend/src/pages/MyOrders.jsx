import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../services/orderServices";
import { ShoppingBag, ArrowRight } from "lucide-react";

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 backdrop-blur-sm rounded-xl border border-gray-200">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />

        <h2 className="text-2xl font-bold text-amber-100 mb-2">
          No Orders Yet
        </h2>

        <p className="text-gray-300 mb-6">
          Looks like you haven't placed any orders.
        </p>

        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          Browse Teas
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-amber-100 mb-8">My Orders</h1>

      <div className="space-y-5">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block backdrop-blur-sm bg-amber-100 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Order #{order.id}
                </h2>

                <p className="text-gray-600 mt-2">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>

                <p className="mt-3 text-gray-700">{order.total_items} items</p>
              </div>

              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}
                >
                  {order.status}
                </span>

                <p className="mt-4 text-2xl font-bold text-emerald-700">
                  ₹{Number(order.total_amount).toFixed(2)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
