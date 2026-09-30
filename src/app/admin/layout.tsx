"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Ticket,
  QrCode,
  FileText,
  LogOut,
  Sparkles,
  Shield,
  Loader2,
  Menu,
  X,
  Settings,
  Crown,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Si estamos en /admin/login no aplicar layout de dashboard
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth/me");
        const data = await res.json();
        if (!data.authenticated || !data.admin) {
          router.push("/admin/login");
          return;
        }
        setAdminUser(data.admin);

        // Si es rol SCANNER y está en una ruta administrativa protegida, redirigir a /admin/scanner
        if (data.admin.role === "SCANNER" && pathname !== "/admin/scanner") {
          router.push("/admin/scanner");
        }
        // Si no es SUPERADMIN e intenta acceder a configuración
        if (pathname === "/admin/config" && data.admin.role !== "SUPERADMIN") {
          router.push("/admin");
        }
      } catch (err) {
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [pathname, isLoginPage, router]);

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07060a] text-zinc-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const isSuperadmin = adminUser?.role === "SUPERADMIN";
  const isScanner = adminUser?.role === "SCANNER";

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, adminOnly: true, superadminOnly: false },
    { label: "Órdenes", href: "/admin/orders", icon: ShoppingCart, adminOnly: true, superadminOnly: false },
    { label: "Boletos", href: "/admin/tickets", icon: Ticket, adminOnly: true, superadminOnly: false },
    { label: "Configuración", href: "/admin/config", icon: Settings, adminOnly: true, superadminOnly: true },
    { label: "Escáner Móvil", href: "/admin/scanner", icon: QrCode, adminOnly: false, superadminOnly: false },
    { label: "Auditoría", href: "/admin/audit", icon: FileText, adminOnly: true, superadminOnly: false },
  ];

  const visibleNav = navItems.filter((i) => {
    if (i.superadminOnly && !isSuperadmin) return false;
    if (i.adminOnly && isScanner) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#07060a] text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0e0c16] border-r border-orange-500/15 p-6 justify-between">
        <div className="space-y-8">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="text-2xl">🎃</span>
            <div>
              <span className="font-extrabold text-base tracking-wider text-white block">THERAVIT360</span>
              <span className="text-[10px] font-mono tracking-widest uppercase flex items-center gap-1">
                {isSuperadmin ? (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400 inline" /> SUPERADMIN
                  </span>
                ) : isScanner ? (
                  <span className="text-orange-400">STAFF PUERTA</span>
                ) : (
                  <span className="text-orange-400">PANEL ADMIN</span>
                )}
              </span>
            </div>
          </Link>

          <nav className="space-y-1.5">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-orange-400 border border-orange-500/30 font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.superadminOnly && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                      SUPER
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-zinc-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono ${
                isSuperadmin
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                  : "bg-orange-500/20 border-orange-500/40 text-orange-400"
              }`}
            >
              {adminUser?.name?.charAt(0) || "A"}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">{adminUser?.name}</span>
              <span
                className={`text-[10px] block font-mono ${
                  isSuperadmin ? "text-amber-400 font-bold" : "text-zinc-400"
                }`}
              >
                {adminUser?.role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-[#0e0c16] border-b border-orange-500/15 p-4 flex items-center justify-between sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl">🎃</span>
          <span className="font-extrabold text-sm tracking-wider text-white">THERAVIT360</span>
        </Link>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              isSuperadmin
                ? "bg-amber-950/60 text-amber-400 border-amber-500/40 font-bold"
                : "bg-orange-950/60 text-orange-400 border-orange-500/30"
            }`}
          >
            {adminUser?.role}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#12101e] border-b border-orange-500/20 p-4 space-y-2 z-30">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive ? "bg-orange-500/20 text-orange-400" : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-950/40 text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
