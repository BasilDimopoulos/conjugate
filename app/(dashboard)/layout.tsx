import SideBar from '../_components/DashboardSideBar';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-full">
      <div className="">
        <SideBar />
      </div>
      <div className='w-full'>
        <div className="overflow-x-hidden w-full bg-appBg2 h-full p-20">{children}</div>
      </div>
    </div>
  );
}
