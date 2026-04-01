import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HiViewGrid,
  HiShoppingBag,
  HiPhotograph,
  HiCollection,
  HiClipboardList,
  HiTag,
  HiLogout,
} from "react-icons/hi";

const links = [
  { to: "/admin", label: "Dashboard", icon: HiViewGrid, end: true },
  { to: "/admin/products", label: "Products", icon: HiShoppingBag },
  { to: "/admin/banners", label: "Banners", icon: HiPhotograph },
  { to: "/admin/gallery", label: "Gallery", icon: HiCollection },
  { to: "/admin/orders", label: "Orders", icon: HiClipboardList },
  { to: "/admin/sizes-subcategories", label: "Sizes & Types", icon: HiTag },
];

interface Props {
  onClose?: () => void;
}

const Sidebar: React.FC<Props> = ({ onClose }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <aside className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <p className="text-base font-bold text-primary">
          Highpoint <span className="text-accent">Admin</span>
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-gray-50 hover:text-primary"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-red-50 hover:text-accent transition-all w-full"
        >
          <HiLogout size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;