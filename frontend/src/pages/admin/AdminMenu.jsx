import { useEffect, useState } from 'react';
import api from '../../services/api';
import Header from '../../components/Header';

export default function AdminMenu() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [catForm, setCatForm] = useState({ name: '', sortOrder: 0 });
  const [itemForm, setItemForm] = useState({
    categoryId: '', name: '', description: '', price: '', isAvailable: true,
  });

  const loadCategories = () => {
    api.get('/menu/categories').then((res) => setCategories(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadCategories(); }, []);

  const createCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/menu/categories', catForm);
      setCatForm({ name: '', sortOrder: 0 });
      setMessage('Category added');
      loadCategories();
    } catch (err) {
      setMessage('Failed to add category');
    }
  };

  const createItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/menu/items', {
        ...itemForm,
        categoryId: Number(itemForm.categoryId),
        price: Number(itemForm.price),
      });
      setItemForm({ categoryId: '', name: '', description: '', price: '', isAvailable: true });
      setMessage('Item added');
      loadCategories();
    } catch (err) {
      setMessage('Failed to add item');
    }
  };

  const toggleAvailable = async (item) => {
    await api.patch(`/menu/items/${item.id}`, { isAvailable: !item.isAvailable });
    loadCategories();
  };

  const deleteItem = async (id) => {
    if (!confirm('Delete this item?')) return;
    await api.delete(`/menu/items/${id}`);
    loadCategories();
  };

  return (
    <div className="min-h-screen bg-white">
      <Header title="Admin — Menu Management" />

      <div className="p-6 max-w-3xl mx-auto space-y-8">
        {message && <p className="text-sm text-orange-600">{message}</p>}

        {/* Add category */}
        <div className="border border-orange-100 rounded-lg p-4">
          <h2 className="font-semibold text-stone-900 mb-3">Add Category</h2>
          <form onSubmit={createCategory} className="flex gap-2">
            <input
              placeholder="Category name"
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              className="flex-1 px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <button className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
              Add
            </button>
          </form>
        </div>

        {/* Add item */}
        <div className="border border-orange-100 rounded-lg p-4">
          <h2 className="font-semibold text-stone-900 mb-3">Add Menu Item</h2>
          <form onSubmit={createItem} className="space-y-2">
            <select
              value={itemForm.categoryId}
              onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm"
              required
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name || `Category #${c.id}`}</option>
              ))}
            </select>
            <input
              placeholder="Item name"
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm"
              required
            />
            <input
              placeholder="Description (optional)"
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm"
            />
            <input
              type="number"
              placeholder="Price"
              value={itemForm.price}
              onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm"
              required
            />
            <button className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
              Add Item
            </button>
          </form>
        </div>

        {/* Existing menu */}
        <div>
          <h2 className="font-semibold text-stone-900 mb-3">Current Menu</h2>
          {loading ? (
            <p className="text-stone-500 text-sm">Loading...</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="mb-4">
                <p className="text-sm font-medium text-stone-700 mb-2">{cat.name || `Category #${cat.id}`}</p>
                <div className="space-y-2">
                  {cat.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border border-orange-100 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm text-stone-900">{item.name}</p>
                        <p className="text-xs text-stone-500">{item.price.toFixed(2)} Birr {item.isAvailable ? '' : '(unavailable)'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleAvailable(item)}
                          className="text-xs text-orange-600 font-medium"
                        >
                          {item.isAvailable ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-xs text-red-600 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}