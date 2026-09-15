import React, { useState, useMemo } from "react";
import { Button, Nav, NavItem, Collapse } from "reactstrap";
import Logo from "../../shared/logo/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../../../../context/AuthContext";
import { Permissions } from "../../../../../constants/permissions";

const navigation = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "bi bi-speedometer2",
  },
  {
    title: "Phân quyền vai trò ",
    href: "/admin/roles",
    icon: "bi bi-shield-check",
    permission: Permissions.Users.ManageRoles,
  },
  {
    title: "Quản trị Thể thao",
    icon: "bi bi-trophy",
    children: [
      {
        title: "Giải đấu",
        href: "/admin/giai-dau",
        icon: "bi bi-trophy-fill",
        permission: Permissions.GiaiDau.View,
      },
      {
        title: "Khối tham gia",
        href: "/admin/khoi",
        icon: "bi bi-diagram-2",
        permission: Permissions.Khoi.View,
      },
      {
        title: "Đơn vị tham gia",
        href: "/admin/don-vi",
        icon: "bi bi-building",
        permission: Permissions.DonVi.View,
      },
      {
        title: "Danh mục môn",
        href: "/admin/danh-muc-mon-the-thao",
        icon: "bi bi-tags",
        permission: Permissions.DanhMucMonTheThao.View,
      },
      {
        title: "Môn thi đấu",
        href: "/admin/mon-the-thao",
        icon: "bi bi-dribbble",
        permission: Permissions.MonTheThao.View,
      },
      {
        title: "Trọng tài",
        href: "/admin/trong-tai",
        icon: "bi bi-whistle",
        permission: Permissions.TrongTai.View,
      },
      {
        title: "Cụm sân",
        href: "/admin/cum-san",
        icon: "bi bi-geo-alt",
        permission: Permissions.SanDau.View,
      },
      {
        title: "Sân đấu",
        href: "/admin/san-dau",
        icon: "bi bi-grid-3x3-gap",
        permission: Permissions.SanDau.View,
      },
    ],
  },
  {
    title: "Phân hệ Theo Vai Trò",
    icon: "bi bi-person-lines-fill",
    children: [
      {
        title: "Đơn vị / Đoàn tham gia",
        href: "/don-vi",
        icon: "bi bi-building",
        roles: ["Admin", "Delegation"],
      },
      {
        title: "Ban tổ chức / Quản lý giải",
        href: "/quan-ly-giai",
        icon: "bi bi-diagram-3",
        roles: ["Admin", "Manager"],
      },
      {
        title: "Trưởng ban trọng tài",
        href: "/truong-ban-trong-tai",
        icon: "bi bi-award",
        roles: ["Admin", "HeadReferee"],
      },
      {
        title: "Trọng tài",
        href: "/trong-tai",
        icon: "bi bi-whistle",
        roles: ["Admin", "Referee", "HeadReferee"],
      },
      {
        title: "Thư ký giải",
        href: "/thu-ky",
        icon: "bi bi-journal-check",
        roles: ["Admin", "Secretary"],
      },
    ],
  },

];

const Sidebar = ({ showMobilemenu }) => {
  const location = usePathname();
  const { hasPermission, user } = useAuth();

  // Lọc danh sách menu dựa theo quyền xem (permission view) hoặc vai trò (roles)
  const filteredNavigation = useMemo(() => {
    const userRoles = user?.roles || [];
    const isAdmin = userRoles.includes("Admin");

    const checkAllowed = (navItem) => {
      if (isAdmin) return true;
      if (navItem.roles && navItem.roles.length > 0) {
        return navItem.roles.some((r) => userRoles.includes(r));
      }
      if (navItem.permission) {
        return hasPermission(navItem.permission);
      }
      return true;
    };

    return navigation
      .map((item) => {
        // Nếu mục đơn có điều kiện bảo vệ
        if (!checkAllowed(item)) {
          return null;
        }

        // Nếu có menu con, lọc các menu con được phép
        if (item.children) {
          const validChildren = item.children.filter((child) => checkAllowed(child));

          // Nếu nhóm menu con không còn mục nào được phép xem -> ẩn luôn nhóm cha
          if (validChildren.length === 0) {
            return null;
          }

          return {
            ...item,
            children: validChildren,
          };
        }

        return item;
      })
      .filter(Boolean);
  }, [hasPermission, user]);

  // Khởi tạo các menu con được mở tự động nếu route hiện tại trùng với menu con
  const [openMenus, setOpenMenus] = useState(() => {
    const initialOpen = {};
    filteredNavigation.forEach((item, index) => {
      if (item.children) {
        const isChildActive = item.children.some((child) => child.href === location);
        if (isChildActive) {
          initialOpen[index] = true;
        }
      }
    });
    return initialOpen;
  });

  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="p-3">
      <div className="d-flex align-items-center">
        <Logo />
        <span className="ms-auto d-lg-none">
          <Button
            close
            size="sm"
            onClick={showMobilemenu}
          ></Button>
        </span>
      </div>
      <div className="pt-4 mt-2">
        <Nav vertical className="sidebarNav">
          {filteredNavigation.map((navi, index) => {
            const hasChildren = navi.children && navi.children.length > 0;
            const isChildActive = hasChildren && navi.children.some((child) => child.href === location);
            const isOpen = !!openMenus[index];

            if (hasChildren) {
              return (
                <NavItem key={index} className="sidenav-bg mb-1">
                  <div
                    onClick={() => toggleMenu(index)}
                    role="button"
                    className={`nav-link py-3 d-flex align-items-center cursor-pointer ${isChildActive ? "text-primary fw-bold" : "text-secondary"
                      }`}
                    style={{ userSelect: "none" }}
                  >
                    <i className={navi.icon}></i>
                    <span className="ms-3 d-inline-block">{navi.title}</span>
                    <i
                      className={`bi ms-auto transition-all ${isOpen ? "bi-chevron-down" : "bi-chevron-right"
                        }`}
                      style={{ fontSize: "0.8rem" }}
                    ></i>
                  </div>

                  <Collapse isOpen={isOpen}>
                    <Nav vertical className="ps-3 border-start ms-3 my-1">
                      {navi.children.map((child, cIndex) => {
                        const isCurrent = location === child.href;
                        return (
                          <NavItem key={cIndex} className="sidenav-bg mb-1">
                            <Link
                              href={child.href}
                              className={`nav-link py-2 d-flex align-items-center ${isCurrent
                                  ? "text-primary fw-bold"
                                  : "text-muted"
                                }`}
                              style={{ fontSize: "0.9rem" }}
                            >
                              <i className={`${child.icon} me-2`} style={{ fontSize: "0.85rem" }}></i>
                              <span>{child.title}</span>
                            </Link>
                          </NavItem>
                        );
                      })}
                    </Nav>
                  </Collapse>
                </NavItem>
              );
            }

            return (
              <NavItem key={index} className="sidenav-bg mb-1">
                <Link
                  href={navi.href}
                  className={
                    location === navi.href
                      ? "text-primary fw-bold nav-link py-3 d-flex align-items-center"
                      : "nav-link text-secondary py-3 d-flex align-items-center"
                  }
                >
                  <i className={navi.icon}></i>
                  <span className="ms-3 d-inline-block">{navi.title}</span>
                </Link>
              </NavItem>
            );
          })}
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;
