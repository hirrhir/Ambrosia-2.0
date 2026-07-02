import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function CustomerMenu() {
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]); // [{ menuItemId, name, price, quantity }]
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/menu/categories').then((res) => setCategories(res.data));
  }, []);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId) => {
    setCart((prev) =>
      prev
        .map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    if (!address.trim()) {
      setMessage('Please enter a delivery address');
      return;
    }
    setPlacing(true);
    setMessage('');
    try {
      await api.post('/orders', {
        orderType: 'delivery',
        deliveryAddress: address,
        items: cart.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      });
      setCart([]);
      setAddress('');
      setMessage('Order placed! Track it in your order history.');
    } catch (err) {
      setMessage('Failed to place order. Try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-orange-100">
        <h1 className="text-2xl font-bold text-stone-900">Menu</h1>
        <div className="flex items-center gap-4">
          <span className="text-stone-500 text-sm">{user?.name}</span>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-orange-600 text-sm font-medium"
          >
            Log Out
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Menu list */}
        <div className="flex-1 p-6 space-y-8">
          {categories.map((cat) => (
            <div key={cat.id}>
              <h2 className="text-lg font-semibold text-stone-900 mb-3">{cat.name}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {cat.items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-orange-100 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-stone-900">{item.name}</p>
                      {item.description && (
                        <p className="text-stone-500 text-sm">{item.description}</p>
                      )}
                      <p className="text-orange-600 font-semibold mt-1">
                        {item.price.toFixed(2)} Birr
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-stone-500">No menu items yet.</p>
          )}
        </div>

        {/* Cart sidebar */}
        <div className="w-full md:w-80 bg-orange-50 p-6 border-l border-orange-100">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Your Order</h2>
          {cart.length === 0 ? (
            <p className="text-stone-500 text-sm">Cart is empty</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.menuItemId} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="text-stone-900">{item.name}</p>
                    <p className="text-stone-500">{item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.menuItemId)}
                    className="text-orange-600 font-medium"
                  >
                    −
                  </button>
                </div>
              ))}
              <div className="border-t border-orange-200 pt-3 flex justify-between font-semibold text-stone-900">
                <span>Total</span>
                <span>{total.toFixed(2)} Birr</span>
              </div>

              <input
                type="text"
                placeholder="Delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />

              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {placing ? 'Placing...' : 'Place Order'}
              </button>
            </div>
          )}
          {message && <p className="text-sm text-stone-600 mt-3">{message}</p>}
        </div>
      </div>
    </div>
  );
}