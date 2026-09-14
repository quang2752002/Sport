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
    title: "Phân quyền vai trò (RBAC)",
    href: "/admin/roles",
    icon: "bi bi-shield-check",
    permission: Permissions.Users.ManageRoles,
  },
  {
    title: "Quản trị Thể thao",
    icon: "bi bi-trophy",
    children: [
      {
        title: "Giải đấu (Tournaments)",
        href: "/admin/tournaments",
        icon: "bi bi-award",
        permission: Permissions.Tournaments.View,
      },
      {
        title: "Phân loại môn (Categories)",
        href: "/admin/categories",
        icon: "bi bi-bookmarks",
        permission: Permissions.Categories.View,
      },
      {
        title: "Môn thể thao (Sports)",
        href: "/admin/sports",
        icon: "bi bi-dribbble",
        permission: Permissions.Sports.View,
      },
      {
        title: "Môn thi thuộc Giải",
        href: "/admin/tournament-sports",
        icon: "bi bi-diagram-3",
        permission: Permissions.TournamentSports.View,
      },
      {
        title: "Bảng đấu (Groups)",
        href: "/admin/groups",
        icon: "bi bi-grid-3x3-gap",
        permission: Permissions.Groups.View,
      },
      {
        title: "Đội thi đấu (Teams)",
        href: "/admin/teams",
        icon: "bi bi-shield-shaded",
        permission: Permissions.Teams.View,
      },
      {
        title: "Vận động viên (Athletes)",
        href: "/admin/athletes",
        icon: "bi bi-people",
        permission: Permissions.Athletes.View,
      },
      {
        title: "Lịch thi đấu & Kết quả (Matches)",
        href: "/admin/matches",
        icon: "bi bi-calendar-event",
        permission: Permissions.Matches.View,
      },
    ],
  },
  {
    title: "Quản lý Trọng tài",
    icon: "bi bi-whistle",
    children: [
      {
        title: "Danh sách trọng tài",
        href: "/referees",
        icon: "bi bi-person-badge",
        permission: Permissions.Referees.Assign,
      },
      {
        title: "Thư ký bàn",
        href: "/secretary",
        icon: "bi bi-clipboard-data",
        permission: Permissions.Results.VerifyReport,
      },
      {
        title: "Đoàn tham gia",
        href: "/delegation",
        icon: "bi bi-people-fill",
        permission: Permissions.Delegations.ViewTeams,
      },
    ],
  },
  {
    title: "Bảng dữ liệu Test",
    href: "/admin/test",
    icon: "bi bi-table",
  },
  {
    title: "UI Components",
    icon: "bi bi-box",
    children: [
      {
        title: "Alerts",
        href: "/ui/alerts",
        icon: "bi bi-bell",
      },
      {
        title: "Badges",
        href: "/ui/badges",
        icon: "bi bi-patch-check",
      },
      {
        title: "Buttons",
        href: "/ui/buttons",
        icon: "bi bi-hdd-stack",
      },
      {
        title: "Cards",
        href: "/ui/cards",
        icon: "bi bi-card-text",
      },
      {
        title: "Grid",
        href: "/ui/grid",
        icon: "bi bi-columns",
      },
      {
        title: "Forms",
        href: "/ui/forms",
        icon: "bi bi-textarea-resize",
      },
      {
        title: "Breadcrumbs",
        href: "/ui/breadcrumbs",
        icon: "bi bi-link",
      },
    ],
  },
  {
    title: "About",
    href: "/pages/about",
    icon: "bi bi-info-circle",
  },
];

const Sidebar = ({ showMobilemenu }) => {
  const location = usePathname();
  const { hasPermission, user } = useAuth();

  // Lọc danh sách menu dựa theo quyền xem (permission view) của người dùng
  const filteredNavigation = useMemo(() => {
    return navigation
      .map((item) => {
        // Nếu mục đơn có permission -> kiểm tra quyền
        if (item.permission && !hasPermission(item.permission)) {
          return null;
        }

        // Nếu có menu con, lọc các menu con có quyền
        if (item.children) {
          const validChildren = item.children.filter((child) => {
            if (!child.permission) return true;
            return hasPermission(child.permission);
          });

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
                    className={`nav-link py-3 d-flex align-items-center cursor-pointer ${
                      isChildActive ? "text-primary fw-bold" : "text-secondary"
                    }`}
                    style={{ userSelect: "none" }}
                  >
                    <i className={navi.icon}></i>
                    <span className="ms-3 d-inline-block">{navi.title}</span>
                    <i
                      className={`bi ms-auto transition-all ${
                        isOpen ? "bi-chevron-down" : "bi-chevron-right"
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
                              className={`nav-link py-2 d-flex align-items-center ${
                                isCurrent
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
