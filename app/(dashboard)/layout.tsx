import SideBar from '../_components/DashboardSideBar';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid grid-cols-[0.5fr_2.5fr] h-screen">
      <div className="col-1 w-64 bg-slate-100 hidden lg:block">
        {/* <SideBar /> */}
        <SideBar />
      </div>
      <div className="col-2 overflow-x-hidden w-full">{children}</div>
    </div>
  );
}
