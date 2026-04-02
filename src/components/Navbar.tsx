import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiMenu, HiX, HiShoppingCart, HiSearch } from "react-icons/hi";
import { useCart } from "../context/CartContext";
import SearchOverlay from "./SearchOverlay";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Gallery", to: "/gallery" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();
  const { totalItems } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="text-lg font-bold tracking-tight text-primary">
            Highpoint <span className="text-accent">Shoes</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.to
                    ? "text-accent"
                    : "text-muted hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center gap-1">

            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-primary hover:bg-gray-50 
                         transition-colors"
              aria-label="Search"
            >
              <HiSearch size={21} />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-primary hover:bg-gray-50 
                         transition-colors"
              aria-label="Cart"
            >
              <HiShoppingCart size={21} />
              {totalItems > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px]
                               bg-accent text-white text-[10px] font-bold rounded-full
                               flex items-center justify-center px-1"
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-primary"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <HiX size={22} /> : <HiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 
                          flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium py-1 ${
                  pathname === link.to ? "text-accent" : "text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium py-1 flex items-center gap-2 ${
                pathname === "/cart" ? "text-accent" : "text-primary"
              }`}
            >
              <HiShoppingCart size={16} />
              Cart
              {totalItems > 0 && (
                <span className="bg-accent text-white text-[10px] font-bold 
                                 rounded-full px-1.5 py-0.5">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        )}
      </header>

      {/* Search Overlay — rendered outside header */}
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
};

export default Navbar;