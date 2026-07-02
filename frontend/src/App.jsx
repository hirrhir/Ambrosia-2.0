import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerMenu from './pages/customer/CustomerMenu';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import WaiterDashboard from './pages/waiter/WaiterDashboard';
import OrderHistory from './pages/customer/OrderHistory';

function PrivateRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/menu"
            element={
              <PrivateRoute allowedRoles={['customer']}>
                <CustomerMenu />
              </PrivateRoute>
            }
          />
          <Route
            path="/kitchen"
            element={
             <PrivateRoute allowedRoles={['kitchen', 'admin']}>
              <KitchenDashboard />
             </PrivateRoute>
           }
          />
          <Route
             path="/waiter"
             element={
              <PrivateRoute allowedRoles={['waiter']}>
               <WaiterDashboard />
             </PrivateRoute>
           }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute allowedRoles={['customer']}>
                <OrderHistory />
              </PrivateRoute>
          }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;