import { useAuthStore } from "@/stores/auth-store";

const DashboardPage = () => {
  const { user } = useAuthStore();

  return <div>Welcome back, {user?.name} 🚀</div>;
};

export default DashboardPage;
