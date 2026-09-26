import { useLayoutEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";
import CookieConsent from "@/components/CookieConsent";

import { HomeExperience, ProjectsExperience, ProjectDetailExperience, GuidesExperience, GuideDetailExperience, NewsExperience, ArticleExperience, FaqExperience, AboutExperience, SupportExperience, LaunchersExperience, LauncherDetailExperience, MissingExperience } from "./pages/PublicExperience";
import Legal from "./pages/Legal";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminEditor from "./pages/admin/AdminEditor";

const queryClient = new QueryClient();

// Componente para resetar o scroll automaticamente
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ThemeProvider>
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <CookieConsent />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<HomeExperience />} />
                <Route path="/projects" element={<ProjectsExperience />} />
                <Route path="/modpacks" element={<ProjectsExperience modpacks />} />
                <Route path="/modpacks/:slug" element={<ProjectDetailExperience />} />
                <Route path="/guides" element={<GuidesExperience />} />
                <Route path="/guides/:slug" element={<GuideDetailExperience />} />
                <Route path="/news" element={<NewsExperience />} />
                <Route path="/news/:slug" element={<ArticleExperience />} />
                <Route path="/launchers" element={<LaunchersExperience />} />
                <Route path="/launchers/:slug" element={<LauncherDetailExperience />} />
                <Route path="/faq" element={<FaqExperience />} />
                <Route path="/about" element={<AboutExperience />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/legal/privacy" element={<Navigate to="/legal?kind=privacy" replace />} />
                <Route path="/legal/terms" element={<Navigate to="/legal?kind=terms" replace />} />
                <Route path="/support" element={<SupportExperience />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/editor" element={<AdminEditor />} />
                <Route path="*" element={<MissingExperience />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
