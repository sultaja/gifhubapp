import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getPendingGifs } from "@/services/api";

const AdminLayout = () => {
  const { t } = useTranslation();
  const { data: pendingGifs } = useQuery({
    queryKey: ["pendingGifs"],
    queryFn: getPendingGifs,
  });

  const pendingCount = pendingGifs?.length || 0;

  const sidebarNavItems = [
    {
      title: t("admin_layout.dashboard"),
      href: "/admin",
    },
    {
      title: t("admin_layout.gifs"),
      href: "/admin/gifs",
    },
    {
      title: t("admin_layout.submissions"),
      href: "/admin/submissions",
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      title: t("admin_layout.categories"),
      href: "/admin/categories",
    },
    {
      title: t("admin_layout.tags"),
      href: "/admin/tags",
    },
    {
      title: t("admin_layout.back_to_site"),
      href: "/",
    },
  ];

  return (
    <div className="container space-y-8 p-4 sm:p-8 md:space-y-12 md:p-10">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {sidebarNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/admin"}
                className={({ isActive }) =>
                  cn(
                    buttonVariants({ variant: "ghost" }),
                    isActive
                      ? "bg-muted hover:bg-muted"
                      : "hover:bg-transparent hover:underline",
                    "justify-start"
                  )
                }
              >
                {item.title}
                {item.badge && (
                  <Badge className="ml-auto">{item.badge}</Badge>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-4/5">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;