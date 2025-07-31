import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Advertise from "./pages/Advertise";
import GifDetail from "./pages/GifDetail";
import CategoryDetail from "./pages/CategoryDetail";
import TagDetail from "./pages/TagDetail";
import SubmitGifPage from "./pages/SubmitGif";
import AdminIndex from "./pages/admin/AdminIndex";
import AdminGifs from "./pages/admin/AdminGifs";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminTags from "./pages/admin/AdminTags";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="gifhub-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/advertise" element={<Advertise />} />
              <Route path="/gif/:slug" element={<GifDetail />} />
              <Route path="/category/:id" element={<CategoryDetail />} />
              <Route path="/tag/:id" element={<TagDetail />} />
              <Route path="/submit" element={<SubmitGifPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminIndex />} />
              <Route path="gifs" element={<AdminGifs />} />
              <Route path="submissions" element={<AdminSubmissions />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="tags" element={<AdminTags />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;