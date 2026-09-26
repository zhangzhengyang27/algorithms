import { TopNav } from './top-nav';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg relative">
      {/* Ambient layers */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-dots" aria-hidden />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[480px] z-0 bg-glow-top" aria-hidden />

      <div className="relative z-10">
        <TopNav />
        <main className="min-h-[calc(100vh-56px)]">{children}</main>
      </div>
    </div>
  );
}
