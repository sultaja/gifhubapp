import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, GitFork, Tag, Settings, Home, FolderKanban, FileText, Languages, Mail, GitPullRequestDraft } from "lucide-react";
import { useTranslation } from "react-i18next";

const AdminSidebar = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { href: "/admin", label: t('admin.sidebar.dashboard'), icon: LayoutDashboard },
    { href: "/admin/gifs", label: t('admin.sidebar.gifs'), icon: GitFork },
    { href: "/admin/categories", label: t('admin.sidebar.categories'), icon: FolderKanban },
    { href: "/admin/tags", label: t('admin.sidebar.tags'), icon: Tag },
    { href: "/admin/gif-submissions", label: t('admin.sidebar.gif_submissions'), icon: GitPullRequestDraft },
    { href: "/admin/contact-submissions", label: t('admin.sidebar.contact_submissions'), icon: Mail },
    { href: "/admin/content", label: t('admin.sidebar.content'), icon: FileText },
    { href: "/admin/translations", label: t('admin.sidebar.translations'), icon: Languages },
    { href: "/admin/settings", label: t('admin.sidebar.settings'), icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="p-4 border-b">
          <Link to="/admin" className="flex items-center space-x-2">
            <span className="font-bold text-lg">{t('admin.sidebar.panel_title')}</span>
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
                {t('admin.sidebar.back_to_site')}
            </Link>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;