import { Navigate, Route, Routes } from "react-router";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import SummaryPage from "./pages/dashboard/SummaryPage";
import CustomersPage from "./pages/dashboard/CustomerPage";
import TransactionsPage from "./pages/dashboard/TransactionPage";
import ProfilePage from "./pages/dashboard/ProfilePage";

import DashboardLayout from "./layouts/DashboardLayout";

import { useAuthStore } from "./stores/auth-store";

const App = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route
        path="/auth/login"
        element={
          !isAuthenticated ? (
            <LoginPage />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
      <Route
        path="/auth/register"
        element={
          !isAuthenticated ? (
            <RegisterPage />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="summary" element={<SummaryPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? "/dashboard" : "/auth/login"}
            replace
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
