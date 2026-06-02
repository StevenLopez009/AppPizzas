import { Home, ShoppingCart, ClipboardList, User } from "lucide-react";

export const menuConfig = [
  { id: "home", label: "Inicio", path: "/dashboard", icon: Home },
  { id: "orders", label: "Carrito", path: "/orders", icon: ShoppingCart },
  { id: "my-orders", label: "Mis pedidos", path: "/my-orders", icon: ClipboardList },
  { id: "profile", label: "Perfil", path: "/profile", icon: User },
];
