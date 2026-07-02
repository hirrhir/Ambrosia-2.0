import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Header from '../../components/Header';

const STATUS_COLOR = {
  pending: 'bg-orange-100 text-orange-700',
  preparing: 'bg-orange-200 text-orange-800',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-stone-100 text-stone-600',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header title="My Orders" />
      <div className="p-6 max-w-2xl mx-auto">
        <Link to="/menu" className="text-orange-600 text-sm font-medium">← Back to Menu</Link>

        {loading ? (
          <p className="text-stone-500 mt-4">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-stone-500 mt-4">No orders yet.</p>
        ) : (
          <div className="space-y-3 mt-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-orange-100 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-stone-900">Order #{order.id}</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLOR[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <ul className="text-sm text-stone-600 mb-2">
                  {order.items.map((item) => (
                    <li key={item.id}>{item.quantity}x {item.menuItem.name}</li>
                  ))}
                </ul>
                <p className="text-orange-600 font-semibold text-sm">{order.totalPrice.toFixed(2)} Birr</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}