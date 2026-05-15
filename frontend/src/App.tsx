import { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DashboardSidebar from "./components/DashboardSidebar";
import HeroSlider from "./components/HeroSlider";
import ArticleCard from "./components/ArticleCard";
import AuthModal from "./components/AuthModal";
import ArticleDetail from "../page/ArticleDetail";
import Dashboard from "../page/Dashboard";
import CreateArticle from "../page/CreateArticle";
import EditArticle from "../page/EditArticle";
import EditProfile from "../page/EditProfile";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { fetchArticles } from "./api";
import type { Article } from "./types";

function AppContent() {
  const { user, logout } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  const filtered = useMemo(
    () =>
      selectedCategory
        ? articles.filter((a) => a.category === selectedCategory)
        : articles,
    [articles, selectedCategory],
  );

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function openLogin() {
    setAuthTab("login");
    setAuthOpen(true);
  }

  function openRegister() {
    setAuthTab("register");
    setAuthOpen(true);
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar
        user={user}
        onOpenLogin={openLogin}
        onOpenRegister={openRegister}
        onLogout={logout}
      />
      <div className="flex">
        {isDashboard ? (
          <DashboardSidebar />
        ) : (
          <Sidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}
        <main className="flex-1 p-6">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  {!loading && <HeroSlider articles={articles} />}

                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-primary">
                      {selectedCategory || "Últimos artículos"}
                    </h1>
                    {selectedCategory && (
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-sm text-primary hover:underline"
                      >
                        Limpiar filtro
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <p className="text-gray-400">Cargando artículos...</p>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-gray-400 text-lg">No hay artículos en esta categoría</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filtered.map((a) => (
                        <ArticleCard key={a.id} article={a} />
                      ))}
                    </div>
                  )}
                </>
              }
            />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/new" element={<CreateArticle />} />
            <Route path="/dashboard/edit/:id" element={<EditArticle />} />
            <Route path="/dashboard/profile" element={<EditProfile />} />
          </Routes>
        </main>
      </div>

      <AuthModal
        open={authOpen}
        defaultTab={authTab}
        onClose={() => setAuthOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
