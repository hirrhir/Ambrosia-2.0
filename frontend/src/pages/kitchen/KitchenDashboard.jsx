import { useEffect, useState } from 'react';
import api from '../../services/api';
import socket from '../../sockets/socket';
import Header from '../../components/Header';

const STATUS_FLOW = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'completed',
};

const STATUS_LABEL = {
  pending: 'Mark Preparing',
  preparing: 'Mark Ready',
  ready: 'Mark Completed',
};

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));

    socket.on('orderUpdated', (updatedOrder) => {
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === updatedOrder.id);
        if (exists) {
          return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
        }
        return [updatedOrder, ...prev];
      });
    });

    return () => socket.off('orderUpdated');
  }, []);

  const advanceStatus = async (order) => {
    const nextStatus = STATUS_FLOW[order.status];
    if (!nextStatus) return;
    await api.patch(`/orders/${order.id}/status`, { status: nextStatus });
  };

  const activeOrders = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));

  return (
    <div className="min-h-screen bg-white">
      <Header title="Kitchen — Order Queue" />

      {loading ? (
        <p className="text-stone-500 p-6">Loading orders...</p>
      ) : (
        <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeOrders.map((order) => (
            <div key={order.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-stone-900">Order #{order.id}</p>
                  <p className="text-xs text-stone-500 uppercase">{order.orderType}</p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-600 text-white">
                  {order.status}
                </span>
              </div>

              <ul className="text-sm text-stone-700 mb-3 space-y-1">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.menuItem.name}
                  </li>
                ))}
              </ul>

              {order.deliveryAddress && (
                <p className="text-xs text-stone-500 mb-2">📍 {order.deliveryAddress}</p>
              )}
              {order.table && (
                <p className="text-xs text-stone-500 mb-2">🪑 Table {order.table.tableNumber}</p>
              )}

              {STATUS_FLOW[order.status] && (
                <button
                  onClick={() => advanceStatus(order)}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 rounded-lg mt-2"
                >
                  {STATUS_LABEL[order.status]}
                </button>
              )}
            </div>
          ))}
          {activeOrders.length === 0 && (
            <p className="text-stone-500 col-span-full">No active orders right now.</p>
          )}
        </div>
      )}
    </div>
  );
}