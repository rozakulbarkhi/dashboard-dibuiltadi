import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  User,
} from "lucide-react";

export type IconType = ComponentType<LucideProps>;

export interface NavLeaf {
  name: string;
  href: string;
  icon: IconType;
}

export interface NavParent {
  name: string;
  icon: IconType;
  children: NavLeaf[];
}

export type NavItem = NavLeaf | NavParent;

export const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Summary", href: "/dashboard/summary", icon: BarChart3 },
  {
    name: "Transactions",
    href: "/dashboard/transactions",
    icon: CreditCard,
  },
  {
    name: "Customers",
    href: "/dashboard/customers",
    icon: Users,
  },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];
