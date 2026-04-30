import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";
import CookieConsent from "@/components/CookieConsent";
import BackToTopNews from "@/components/BackToTopNews";

import Home from "./pages/Home";
import Modpacks from "./pages/Modpacks";
import ModpackDetail from "./pages/ModpackDetail";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import Faq from "./pages/Faq";
import About from "./pages/About";
import Legal from "./pages/Legal";
import Support from "./pages/Support";
import Launchers from "./pages/Launchers";
import LauncherDetail from "./pages/LauncherDetail";
import LauncherRoutesLayout from "./pages/launchers/LauncherRoutesLayout";
import NewsRoutesLayout from "./pages/news/NewsRoutesLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminEditor from "./pages/admin/AdminEditor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
            <BackToTopNews />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/modpacks" element={<Modpacks />} />
              <Route path="/modpacks/:slug" element={<ModpackDetail />} />
              <Route path="/news" element={<NewsRoutesLayout />}>
                <Route index element={<News />} />
                <Route path=":slug" element={<NewsArticle />} />
              </Route>
              <Route path="/launchers" element={<LauncherRoutesLayout />}>
                <Route index element={<Launchers />} />
                <Route path=":slug" element={<LauncherDetail />} />
              </Route>
              <Route path="/faq" element={<Faq />} />
              <Route path="/about" element={<About />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/legal/privacy" element={<Navigate to="/legal?kind=privacy" replace />} />
              <Route path="/legal/terms" element={<Navigate to="/legal?kind=terms" replace />} />
              <Route path="/support" element={<Support />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/editor" element={<AdminEditor />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </I18nProvider>
    </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
