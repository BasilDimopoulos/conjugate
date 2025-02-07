import SideBar from '../_components/DashboardSideBar';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full">
      <div className="w-64 hidden lg:block">
        <SideBar />
      </div>
      <div className='w-full'>
        <div className="bg-appBg h-16 w-full"></div>
        <div className="overflow-x-hidden w-full bg-appBg2 h-full">{children}</div>
      </div>
    </div>
  );
}
