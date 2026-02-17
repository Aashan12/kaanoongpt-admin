'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, LayoutGrid, Scale, Globe, MapPin, FileText, Gavel, Grid3x3, Brain, Users, Building2, UserCheck, UserCircle, Settings, BookOpen, Layers, Briefcase } from 'lucide-react';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [pathname, router]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.navActionSection}`)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      window.addEventListener('click', handleOutsideClick);
    }

    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  if (loading) return <div className={styles.loadingContainer}>Loading...</div>;

  if (pathname === '/admin/login') {
    return children;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.adminLayout}>
      {/* Left Sidebar */}
      <aside className={styles.sidebar}>
        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarBrand}>
            <div className={styles.sidebarLogo}>
              <Scale size={32} color="#fbbf24" strokeWidth={1.5} />
            </div>
            <div className={styles.sidebarBrandText}>
              <div className={styles.sidebarBrandTitle}>KaanoonGPT</div>
              <div className={styles.sidebarBrandSubtitle}>Admin Portal</div>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className={styles.sidebarNav}>
          {/* Dashboard Section */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>Dashboard</div>
            <Link
              href="/admin/dashboard"
              className={`${styles.sidebarItem} ${pathname === '/admin/dashboard' ? styles.sidebarItemActive : ''}`}
            >
              <LayoutGrid size={20} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>Dashboard</span>
            </Link>
          </div>

          {/* Law Firm Management Section */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>Law Firm Management</div>
            <Link
              href="/admin/law-firms/registrations"
              className={`${styles.sidebarItem} ${pathname === '/admin/law-firms/registrations' ? styles.sidebarItemActive : ''}`}
            >
              <UserCheck size={20} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>Registrations</span>
            </Link>
            <Link
              href="/admin/law-firms/accounts"
              className={`${styles.sidebarItem} ${pathname === '/admin/law-firms/accounts' ? styles.sidebarItemActive : ''}`}
            >
              <Building2 size={20} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>Firm Accounts</span>
            </Link>
            <Link
              href="/admin/law-firms/users"
              className={`${styles.sidebarItem} ${pathname === '/admin/law-firms/users' ? styles.sidebarItemActive : ''}`}
            >
              <Users size={20} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>Firm Users</span>
            </Link>
          </div>

          {/* Knowledge Base Section */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>Knowledge Base</div>
            <Link
              href="/admin/knowledge-base/laws"
              className={`${styles.sidebarItem} ${pathname === '/admin/knowledge-base/laws' ? styles.sidebarItemActive : ''}`}
            >
              <BookOpen size={20} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>Laws & Regulations</span>
            </Link>
            <Link
              href="/admin/knowledge-base/cases"
              className={`${styles.sidebarItem} ${pathname === '/admin/knowledge-base/cases' ? styles.sidebarItemActive : ''}`}
            >
              <Scale size={20} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>Cases & Precedents</span>
            </Link>
          </div>

          {/* System Setup Section */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>System Setup</div>
            <Link
              href="/admin/setup/countries"
              className={`${styles.sidebarSubItem} ${pathname === '/admin/setup/countries' ? styles.sidebarItemActive : ''}`}
            >
              <Globe size={18} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>Countries</span>
            </Link>
            <Link
              href="/admin/setup/states"
              className={`${styles.sidebarSubItem} ${pathname === '/admin/setup/states' ? styles.sidebarItemActive : ''}`}
            >
              <MapPin size={18} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>States/Regions</span>
            </Link>
            <Link
              href="/admin/setup/case-types"
              className={`${styles.sidebarSubItem} ${pathname === '/admin/setup/case-types' ? styles.sidebarItemActive : ''}`}
            >
              <FileText size={18} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>Case Types</span>
            </Link>
            <Link
              href="/admin/setup/court-types"
              className={`${styles.sidebarSubItem} ${pathname === '/admin/setup/court-types' ? styles.sidebarItemActive : ''}`}
            >
              <Gavel size={18} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>Court Types</span>
            </Link>
            <Link
              href="/admin/setup/user-types"
              className={`${styles.sidebarSubItem} ${pathname === '/admin/setup/user-types' ? styles.sidebarItemActive : ''}`}
            >
              <Users size={18} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>User Types</span>
            </Link>
            <Link
              href="/admin/setup/law-categories"
              className={`${styles.sidebarSubItem} ${pathname === '/admin/setup/law-categories' ? styles.sidebarItemActive : ''}`}
            >
              <Layers size={18} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>Law Categories</span>
            </Link>
            <Link
              href="/admin/setup/legal-practice-areas"
              className={`${styles.sidebarSubItem} ${pathname === '/admin/setup/legal-practice-areas' ? styles.sidebarItemActive : ''}`}
            >
              <Briefcase size={18} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>Practice Areas</span>
            </Link>
            <Link
              href="/admin/setup/manage-layout"
              className={`${styles.sidebarSubItem} ${pathname === '/admin/setup/manage-layout' ? styles.sidebarItemActive : ''}`}
            >
              <Grid3x3 size={18} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>Manage Layout</span>
            </Link>
          </div>

          {/* Model Management Section */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>Model Management</div>
            <Link
              href="/admin/model_management/models"
              className={`${styles.sidebarItem} ${pathname === '/admin/model_management/models' ? styles.sidebarItemActive : ''}`}
            >
              <Brain size={20} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>Models</span>
            </Link>
          </div>

          {/* Account Settings Section */}
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>Account Settings</div>
            <Link
              href="/admin/settings/profile"
              className={`${styles.sidebarItem} ${pathname === '/admin/settings/profile' ? styles.sidebarItemActive : ''}`}
            >
              <UserCircle size={20} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>Profile</span>
            </Link>
            <Link
              href="/admin/settings/security"
              className={`${styles.sidebarItem} ${pathname === '/admin/settings/security' ? styles.sidebarItemActive : ''}`}
            >
              <Settings size={20} className={styles.sidebarIcon} />
              <span className={styles.sidebarLabel}>Settings</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Right Content */}
      <main className={styles.adminMain}>
        <header className={styles.topNavbar}>
          <div className={styles.navUserSection}>
            <div className={styles.navUserAvatar}>
              <UserCircle size={24} />
            </div>
            <div className={styles.navUserInfo}>
              <span className={styles.navUserName}>Test</span>
              <span className={styles.navUserRole}>Admin</span>
            </div>
          </div>

          <div className={styles.navActionSection}>
            <button
              className={`${styles.navActionBtn} ${isDropdownOpen ? styles.navActionBtnActive : ''}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title="Profile Menu"
            >
              <UserCircle size={24} />
            </button>

            {isDropdownOpen && (
              <div className={styles.profileDropdown}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownAvatarLarge}>
                    <UserCircle size={32} />
                  </div>
                </div>
                <div className={styles.dropdownBody}>
                  <Link href="/admin/settings/profile" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                    <UserCircle size={18} />
                    <span>Profile</span>
                  </Link>
                  <Link href="/admin/settings/security" className={styles.dropdownItem} onClick={() => setIsDropdownOpen(false)}>
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>
                  <div className={styles.dropdownDivider}></div>
                  <button className={`${styles.dropdownItem} ${styles.dropdownItemLogout}`} onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}
