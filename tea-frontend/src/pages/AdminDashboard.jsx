import { useEffect, useState } from "react";
import api from "../utils/axios";
import {
  getDashboardStats
} from "../services/dashboardService";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getDashboardStats();

            setStats(data);

        } catch (err) {

            setError(
                "Failed to load dashboard data"
            );

        }
    };

    if (error) {
        return (
            <div className="text-red-500">
                {error}
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="animate-pulse">

                    <div className="h-10 w-64 bg-gray-200 rounded mb-8" />

                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-28 bg-gray-200 rounded-xl"
                            />
                        ))}
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-emerald-600">
                Inventory Dashboard
            </h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">

                <div className="bg-amber-100/70 backdrop-blur-sm p-5 rounded-xl shadow">
                    <h3 className="text-sm text-gray-500">
                        Total Teas
                    </h3>
                    <p className="text-3xl font-bold">
                        {stats.total_teas}
                    </p>
                </div>

                <div className="bg-amber-100/70 backdrop-blur-sm p-5 rounded-xl shadow">
                    <h3 className="text-sm text-gray-500">
                        Total Users
                    </h3>
                    <p className="text-3xl font-bold">
                        {stats.total_users}
                    </p>
                </div>

                <div className="bg-amber-100/70 backdrop-blur-sm p-5 rounded-xl shadow">
                    <h3 className="text-sm text-gray-500">
                        Inventory Value
                    </h3>
                    <p className="text-3xl font-bold">
                        ₹{stats.inventory_value}
                    </p>
                </div>

                <div className="bg-amber-100/70 backdrop-blur-sm p-5 rounded-xl shadow">
                    <h3 className="text-sm text-gray-500">
                        Average Tea Price
                    </h3>
                    <p className="text-3xl font-bold">
                        ₹{Math.round(stats.avg_price)}
                    </p>
                </div>

            </div>
            <div className="bg-amber-100/70 backdrop-blur-sm rounded-xl shadow p-5 mb-8">
                <h2 className="text-xl font-semibold mb-4">
                    Low Stock Alerts
                </h2>

                {stats.low_stock_teas.length === 0 ? (
                    <p>No low stock items.</p>
                ) : (
                    <div className="space-y-3">
                        {stats.low_stock_teas.map((tea) => (
                            <div
                                key={tea.id}
                                className="flex justify-between border-b pb-2"
                            >
                                <span>{tea.name}</span>
                                <span className="text-red-500 font-semibold">
                                    {tea.stock} left
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-amber-100/70 backdrop-blur-sm rounded-xl shadow p-5">

                    <h2 className="text-xl font-semibold mb-4">
                        Latest Teas
                    </h2>

                    <div className="space-y-3">

                        {stats.latest_teas.map((tea) => (
                            <div
                                key={tea.id}
                                className="flex justify-between"
                            >
                                <span>{tea.name}</span>

                                <span>
                                    ₹{tea.price}
                                </span>
                            </div>
                        ))}

                    </div>

                </div>
                <div className="bg-amber-100/70 backdrop-blur-sm rounded-xl shadow p-5">

                    <h2 className="text-xl font-semibold mb-4">
                        Latest Users
                    </h2>

                    <div className="space-y-3">

                        {stats.latest_users.map((user) => (
                            <div
                                key={user.id}
                                className="flex justify-between"
                            >
                                <span>{user.username}</span>

                                <span className="text-sm text-gray-500">
                                    {new Date(
                                        user.date_joined
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        ))}

                    </div>

                </div>
            </div>
            <div className="bg-amber-100/70 backdrop-blur-sm rounded-xl shadow p-5 mt-8">

                <h2 className="text-xl font-semibold mb-4">
                    Premium Teas
                </h2>

                <div className="space-y-3">

                    {stats.top_expensive_teas.map((tea) => (
                        <div
                            key={tea.id}
                            className="flex justify-between"
                        >
                            <span>{tea.name}</span>

                            <span className="font-semibold">
                                ₹{tea.price}
                            </span>
                        </div>
                    ))}

                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;