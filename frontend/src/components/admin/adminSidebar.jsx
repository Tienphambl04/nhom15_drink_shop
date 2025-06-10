import React, { useState, useEffect, useMemo, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  FolderOpen,
  FileText,
  ShoppingCart,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  UserCheck,
} from "lucide-react";
import "./adminSidebar.css";

const AdminSidebar = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    users: false,
    categories: false,
    blogs: false,
    orders: false,
    contacts: false,
  });

  // Memoized menu items to prevent unnecessary re-renders
  const menuItems = useMemo(
    () => [
      {
        key: "users",
        label: "Quản lí người dùng",
        icon: Users,
        submenu: [
          { label: "Danh sách người dùng", path: "/admin/users", icon: List },
          { label: "Thêm người dùng", path: "/admin/users/add", icon: Plus },
        ],
      },
      {
        key: "categories",
        label: "Quản lí danh mục",
        icon: FolderOpen,
        submenu: [
          { label: "Danh sách danh mục", path: "/admin/danh-muc", icon: List },
          {
            label: "Thêm danh mục mới",
            path: "/admin/danh-muc/add",
            icon: Plus,
          },
          { label: "Thêm đồ uống mới", path: "/admin/do-uong/add", icon: Plus },
          {
            label: "Thêm tùy chọn mới",
            path: "/admin/tuy-chon/add",
            icon: Plus,
          },
        ],
      },
      {
        key: "blogs",
        label: "Quản lí blog",
        icon: FileText,
        submenu: [
          { label: "Danh sách blog", path: "/admin/blogs", icon: List },
          { label: "Thêm blog mới", path: "/admin/blogs/add", icon: Plus },
        ],
      },
      {
        key: "orders",
        label: "Quản lí đơn hàng",
        icon: ShoppingCart,
        submenu: [
          { label: "Danh sách đơn hàng", path: "/admin/don-hang", icon: List },
        ],
      },
      {
        key: "contacts",
        label: "Quản lí liên hệ",
        icon: MessageCircle,
        submenu: [
          { label: "Danh sách liên hệ", path: "/admin/contacts", icon: List },
        ],
      },
    ],
    []
  );

  // Auto-open menu if current path matches any submenu item
  useEffect(() => {
    const currentPath = location.pathname;
    const newOpenMenus = { ...openMenus };
    let hasChanges = false;

    menuItems.forEach((item) => {
      const hasActiveSubmenu = item.submenu.some(
        (subItem) =>
          currentPath === subItem.path ||
          currentPath.startsWith(subItem.path + "/")
      );

      if (hasActiveSubmenu && !newOpenMenus[item.key]) {
        newOpenMenus[item.key] = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setOpenMenus(newOpenMenus);
    }
  }, [location.pathname, menuItems, openMenus]);

  // Memoized toggle function
  const toggleMenu = useCallback((menuName) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName], // Chỉ toggle trạng thái của menu được nhấp
    }));
  }, []);

  // Memoized active link checker
  const isActiveLink = useCallback(
    (path) => {
      return (
        location.pathname === path || location.pathname.startsWith(path + "/")
      );
    },
    [location.pathname]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e, menuName) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMenu(menuName);
      }
    },
    [toggleMenu]
  );

  return (
    <nav
      className="admin-sidebar"
      role="navigation"
      aria-label="Admin Navigation"
    >
      <header className="sidebar-header">
        <div className="admin-avatar">
          <div className="avatar-circle" role="img" aria-label="Admin Avatar">
            <Users size={24} className="text-white" />
          </div>
        </div>
        <h2 className="sidebar-title">Quản Trị Viên</h2>
        <div className="title-decoration" aria-hidden="true" />
      </header>

      <div className="menu-container">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isMenuOpen = openMenus[item.key];

          return (
            <div key={item.key} className="menu-item">
              <div
                className={`menu-header ${isMenuOpen ? "active" : ""}`}
                onClick={() => toggleMenu(item.key)}
                onKeyDown={(e) => handleKeyDown(e, item.key)}
                role="button"
                tabIndex={0}
                aria-expanded={isMenuOpen}
                aria-controls={`submenu-${item.key}`}
              >
                <div className="menu-content">
                  <div className="menu-icon" aria-hidden="true">
                    <IconComponent size={20} />
                  </div>
                  <span className="menu-label">{item.label}</span>
                </div>

                <div className="toggle-icon" aria-hidden="true">
                  {isMenuOpen ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </div>
              </div>

              <div
                className={`submenu-container ${isMenuOpen ? "open" : ""}`}
                id={`submenu-${item.key}`}
                role="region"
                aria-labelledby={`menu-${item.key}`}
              >
                <nav className="submenu" role="menu">
                  {item.submenu.map((subItem, index) => {
                    const SubIconComponent = subItem.icon;

                    return (
                      <div
                        key={`${item.key}-${index}`}
                        className="submenu-item"
                        role="none"
                      >
                        <NavLink
                          to={subItem.path}
                          className={({ isActive }) =>
                            `submenu-link ${
                              isActive || isActiveLink(subItem.path)
                                ? "active"
                                : ""
                            }`
                          }
                          end={subItem.path === "/admin/users"}
                          role="menuitem"
                          aria-current={
                            isActiveLink(subItem.path) ? "page" : undefined
                          }
                        >
                          <div className="submenu-icon" aria-hidden="true">
                            <SubIconComponent size={16} />
                          </div>
                          <span>{subItem.label}</span>
                        </NavLink>
                      </div>
                    );
                  })}
                </nav>
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminSidebar;
