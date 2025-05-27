import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TestimonialAvatar from './TestimonialAvatar';
import { motion } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [username, setUsername] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { name: "Problems", path: "/problems" },
    { name: "Contests", path: "/contests" },
    { name: "Discuss", path: "/central_forum" },
    { name: "Submissions", path: "/submissions" },
    { name: "Profile", path: "/profile" }
  ];

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`navbar fixed top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-base-100/80 backdrop-blur-lg shadow-lg' 
          : 'bg-base-100'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex-none">
          <motion.a
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CodeVerse
          </motion.a>
        </div>

        {/* Navigation Items - Centered */}
        <div className="flex-1 flex justify-center">
          <ul className="menu menu-horizontal px-1">
            {navItems.map((item, index) => (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <a
                  href={item.path}
                  className="hover:text-primary transition-colors duration-300"
                >
                  {item.name}
                </a>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Profile Section - Far Right */}
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <motion.label
              tabIndex={0}
              className="btn btn-ghost btn-circle avatar"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <TestimonialAvatar name={username} color="#4a9eff" />
              </div>
            </motion.label>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-300"
            >
              <li>
                <a href="/settings" className="justify-between hover:bg-base-200">
                  <span>Settings</span>
                  <span className="badge badge-sm">New</span>
                </a>
              </li>
              <li>
                <motion.button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 hover:bg-base-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {theme === 'light' ? (
                    <>
                      <svg
                        aria-label="moon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                      >
                        <g
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          strokeWidth="2"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                        </g>
                      </svg>
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <svg
                        aria-label="sun"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                      >
                        <g
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          strokeWidth="2"
                          fill="none"
                          stroke="currentColor"
                        >
                          <circle cx="12" cy="12" r="4"></circle>
                          <path d="M12 2v2"></path>
                          <path d="M12 20v2"></path>
                          <path d="m4.93 4.93 1.41 1.41"></path>
                          <path d="m17.66 17.66 1.41 1.41"></path>
                          <path d="M2 12h2"></path>
                          <path d="M20 12h2"></path>
                          <path d="m6.34 17.66-1.41 1.41"></path>
                          <path d="m19.07 4.93-1.41 1.41"></path>
                        </g>
                      </svg>
                      Light Mode
                    </>
                  )}
                </motion.button>
              </li>
              <li>
                <motion.button
                  onClick={handleLogout}
                  className="text-error hover:bg-error/10"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Logout
                </motion.button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
