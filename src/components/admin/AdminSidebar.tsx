import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, GitFork, Tag, Settings, Home, FolderKanban, FileText, Languages } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/gifs", label: "GIFs", icon: GitFork },
  { href: "/admin/categories", label: "Categories", icon: FolderKanban },
  { href: "/admin/tags", label: "Tags", icon: Tag },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/translations", label: "Translations", icon: Languages },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="p-4 border-b">
          <Link to="/admin" className="flex items-center space-x-2">
            <span className="font-bold text-lg">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t">
            <Link to="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                <Home className="mr-2 h-4 w-4" />
                Back to Site
            </Link>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;