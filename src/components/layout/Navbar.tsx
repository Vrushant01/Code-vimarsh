import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Menu, X, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Events', path: '/events' },
  { name: 'Team', path: '/team' },
  { name: 'Projects', path: '/projects' },
  { name: 'Forum', path: '/forum' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-2 rounded-lg"
            >
              <img src="/logo.svg" alt="Code Vimarsh Logo" className="w-6 h-6" />
            </motion.div>
            <span className="text-xl font-bold text-gradient">Code Vimarsh</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-secondary rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Shield className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    {user?.username}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="glow" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Shield className="w-4 h-4" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start gap-2" onClick={() => { logout(); setIsOpen(false); }}>
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button variant="glow" className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}
