import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";

import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/layout/AdminLayout";

import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Advertise from "./pages/Advertise";
import GifPage from "./pages/GifPage";
import CategoryPage from "./pages/CategoryPage";
import TagPage from "./pages/TagPage";
import SearchPage from "./pages/SearchPage";
import SubmitGifPage from "./pages/SubmitGif";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/admin/Dashboard";
import AdminGifsPage from "./pages/admin/Gifs";
import AdminCategoriesPage from "./pages/admin/Categories";
import AdminTagsPage from "./pages/admin/Tags";
import AdminSubmissionsPage from "./pages/admin/Submissions";
import AdminContentPage from "./pages/admin/Content";
import AdminTranslationsPage from "./pages/admin/Translations";
import AdminSettingsPage from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="gifhub-ui-theme">
      <SiteSettingsProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/advertise" element={<Advertise />} />
                <Route path="/gif/:slug" element={<GifPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/tag/:slug" element={<TagPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/submit" element={<SubmitGifPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="gifs" element={<AdminGifsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="tags" element={<AdminTagsPage />} />
                <Route path="submissions" element={<AdminSubmissionsPage />} />
                <Route path="content" element={<AdminContentPage />} />
                <Route path="translations" element={<AdminTranslationsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </SiteSettingsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;