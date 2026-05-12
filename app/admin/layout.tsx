import '../../app/globals.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #e8dfd4 0%, #d4c9b8 50%, #c8b99a 100%)' }}>
      {children}
    </div>
  );
}