import Sidebar from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      {/* Content area */}
      <main className="lg:pl-56 pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
