'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import NotificationBell from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Sparkles, Lock } from 'lucide-react';
import { useNotificationCount } from '@/hooks/useNotificationCount';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [license, setLicense] = useState<any>(null);
  const [licenseLoading, setLicenseLoading] = useState(true);
  const unreadCount = useNotificationCount();

  useEffect(() => {
    // Fetch license from server API (not localStorage)
    const fetchLicense = async () => {
      try {
        const res = await fetch('/api/license/check', {
          cache: 'no-store'
        });
        const data = await res.json();
        
        if (data.active && data.license) {
          setLicense(data.license);
        } else {
          setLicense(null);
        }
      } catch (error) {
        console.error('Failed to fetch license:', error);
        setLicense(null);
      } finally {
        setLicenseLoading(false);
      }
    };

    fetchLicense();
  }, []);

  const isFeatureLocked = (feature: string | null) => {
    if (!feature) return false; // feature not gated
    if (licenseLoading) return false; // Don't show locks while loading
    if (!license?.features) return true;
    return !license.features[feature];
  };

  const getNavLinks = () => {
    switch (session?.user.role) {
      case 'branch_manager':
        return [
          { href: '/branch', label: 'Dashboard', icon: '📊', gradient: 'from-blue-500 to-cyan-500', feature: null },
          { href: '/branch/requests/new', label: 'New Request', icon: '➕', gradient: 'from-green-500 to-emerald-500', feature: null },
          { href: '/branch/history', label: 'History', icon: '📜', gradient: 'from-purple-500 to-pink-500', feature: null },
          { href: '/branch/complaints', label: 'Complaints', icon: '📋', gradient: 'from-orange-500 to-red-500', feature: null },
          { href: '/branch/queries', label: 'Queries', icon: '❓', gradient: 'from-yellow-500 to-orange-500', feature: 'querySystem' },
          { href: '/branch/messages', label: 'Messages', icon: '💬', gradient: 'from-indigo-500 to-purple-500', showBadge: true, feature: null }
        ];

      case 'warehouse_manager':
        return [
          { href: '/warehouse', label: 'Dashboard', icon: '📊', gradient: 'from-blue-500 to-cyan-500', feature: null },
          { href: '/warehouse/products', label: 'Products', icon: '📦', gradient: 'from-green-500 to-teal-500', feature: null },
          { href: '/warehouse/complaints', label: 'Complaints', icon: '📋', gradient: 'from-orange-500 to-red-500', feature: null },
          { href: '/warehouse/queries', label: 'Queries', icon: '❓', gradient: 'from-yellow-500 to-orange-500', feature: 'querySystem' },
          { href: '/warehouse/messages', label: 'Messages', icon: '💬', gradient: 'from-indigo-500 to-purple-500', showBadge: true, feature: null },
          { href: '/warehouse/analytics', label: 'Analytics', icon: '📈', gradient: 'from-pink-500 to-rose-500', feature: 'advancedAnalytics' },
          { href: '/warehouse/reports', label: 'Reports', icon: '📄', gradient: 'from-violet-500 to-purple-500', feature: 'customReports' },
          { href: '/warehouse/anomalies', label: 'Anomalies', icon: '⚠️', gradient: 'from-red-500 to-pink-500', feature: 'anomalyDetection' }
        ];

      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard', icon: '📊', gradient: 'from-blue-500 to-cyan-500', feature: null },
          { href: '/admin/users', label: 'Users', icon: '👥', gradient: 'from-green-500 to-emerald-500', feature: null },
          { href: '/admin/branches', label: 'Branches', icon: '🏢', gradient: 'from-purple-500 to-pink-500', feature: null },
          { href: '/admin/analytics', label: 'Analytics', icon: '📈', gradient: 'from-orange-500 to-red-500', feature: null },
          { href: '/admin/queries', label: 'Queries', icon: '❓', gradient: 'from-yellow-500 to-orange-500', feature: null },
          { href: '/admin/anomalies', label: 'Anomalies', icon: '⚠️', gradient: 'from-red-500 to-pink-500', feature: null },
          { href: '/admin/licenses', label: 'Licenses', icon: '🔑', gradient: 'from-indigo-500 to-purple-500', feature: null }
        ];

      case 'hr':
        return [
          { href: '/hr', label: 'Dashboard', icon: '📊', gradient: 'from-blue-500 to-cyan-500', feature: null },
          { href: '/hr/analytics', label: 'Analytics', icon: '📈', gradient: 'from-purple-500 to-pink-500', feature: null },
          { href: '/hr/queries', label: 'Queries', icon: '❓', gradient: 'from-yellow-500 to-orange-500', feature: 'querySystem' },
          { href: '/hr/anomalies', label: 'Anomalies', icon: '⚠️', gradient: 'from-red-500 to-pink-500', feature: 'anomalyDetection' }
        ];

      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-gray-200/50 dark:border-yellow-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-yellow-500 dark:to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-yellow-500 dark:to-orange-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-yellow-500 dark:via-orange-500 dark:to-red-500 bg-clip-text text-transparent">
                Warehouse
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Management System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/90 dark:bg-black/90 backdrop-blur-xl hover:bg-white dark:hover:bg-black transition-all duration-300 border border-gray-300 dark:border-yellow-500/30 shadow-lg hover:shadow-xl"
              >
                <Menu size={20} className="text-gray-700 dark:text-yellow-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Menu</span>

                {unreadCount > 0 && (
                  <span className="ml-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}

                <ChevronDown size={16} className={`text-gray-700 dark:text-yellow-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>

                  <div className="absolute top-full mt-3 left-0 w-80 z-50 animate-fadeIn">
                    <div className="backdrop-blur-2xl bg-white/95 dark:bg-black/95 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-yellow-500/30 overflow-hidden">
                      <div className="max-h-[70vh] overflow-y-auto p-2 space-y-1">

                        {navLinks.map((link, idx) => {
                          const locked = isFeatureLocked(link.feature);

                          return (
                            <Link
                              key={idx}
                              href={locked ? '#' : link.href}
                              onClick={(e) => {
                                if (locked) {
                                  e.preventDefault();
                                  alert(`🔒 ${link.label} requires Professional or Enterprise plan.\n\nVisit /pricing to upgrade!`);
                                } else {
                                  setIsDropdownOpen(false);
                                }
                              }}
                              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group/item ${
                                locked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${link.gradient} flex items-center justify-center text-xl shadow-lg ${locked ? '' : 'group-hover/item:scale-110'} transition-transform duration-300`}>
                                {link.icon}
                              </div>

                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1">
                                {link.label}
                              </span>

                              {locked && <Lock size={16} className="text-orange-600 dark:text-orange-400" />}

                              {link.showBadge && unreadCount > 0 && !locked && (
                                <span className="w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                              )}
                            </Link>
                          );
                        })}

                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* License Badge */}
            {license && (
              <Link
                href="/pricing"
                className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-xs font-semibold hover:shadow-lg transition-all flex items-center gap-1"
              >
                <Sparkles size={12} />
                {license.type?.toUpperCase()}
              </Link>
            )}

            <ThemeToggle />
            <NotificationBell />

            {/* Profile + Logout */}
            <div className="flex items-center gap-4">
              <div className="backdrop-blur-xl bg-white/90 dark:bg-black/90 px-4 py-2 rounded-xl flex items-center gap-3 border border-gray-200 dark:border-yellow-500/30 shadow-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 dark:from-yellow-500 dark:to-orange-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {session?.user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {session?.user.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-yellow-500">
                    {session?.user.branchName || session?.user.role?.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="relative group px-6 py-2.5 rounded-xl font-semibold text-white overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600"></div>
                <span className="relative z-10 text-sm">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl backdrop-blur-xl bg-white/90 dark:bg-black/90 border border-gray-300 dark:border-yellow-500/30 transition-all duration-300"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 backdrop-blur-2xl bg-white/95 dark:bg-black/95 rounded-2xl p-4 animate-slideIn border-2 border-gray-200 dark:border-yellow-500/30 shadow-2xl">
            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {navLinks.map((link, idx) => {
                const locked = isFeatureLocked(link.feature);

                return (
                  <Link
                    key={idx}
                    href={locked ? '#' : link.href}
                    onClick={(e) => {
                      if (locked) {
                        e.preventDefault();
                        alert(`🔒 ${link.label} is locked. Upgrade required.`);
                      } else {
                        setIsMenuOpen(false);
                      }
                    }}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                      locked ? 'bg-gray-100 dark:bg-gray-800 opacity-60' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="font-semibold flex-1">{link.label}</span>

                    {locked && <Lock size={16} className="text-orange-500" />}

                    {link.showBadge && unreadCount > 0 && !locked && (
                      <span className="w-6 h-6 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full mt-4 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-pink-600 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}