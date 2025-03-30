import { prisma } from '@/utils/db';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { BiChevronDown } from 'react-icons/bi';
import { getUser } from '../_services/user';

const DashboardSideBar: React.FC = async() => {
  const currentUser = await getUser();
  const userData = await prisma.user.findFirst({
    where: { clerkId: currentUser },
  });
  console.log("UserData: ", userData)
  return (
    <nav className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-screen-xl py-6 flex items-center justify-between z-50 bg-transparent">
      <div className="flex items-center gap-x-20">
        <Link href="/app">
          <Image
            src="/images/conjugate.svg"
            width={120}
            height={120}
            alt="confugate logo"
          />
        </Link>
      </div>
      <nav className="flex gap-x-2">
        {[
          {
            label: 'Stories',
            // icon: <BiMapAlt className={iconStyle} />,
            path: '/stories',
          },
          {
            label: 'Learn',
            // icon: <BiLibrary className={iconStyle} />,
            path: '/learn',
          },
          {
            label: 'Review',
            // icon: <BiPen className={iconStyle} />,
            path: '/review',
          },
        ].map((item, index) => (
          <Link
            key={index}
            className="flex items-center px-3 py-2 text-white/80 transition-colors duration-300 transform rounded-lg hover:bg-gray-100 hover:text-gray-700"
            href={item.path}
          >
            {/* {item.icon} */}
            <span className="mx-2 text-sm font-medium font-sans">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-x-8">
        <button className="flex items-center gap-x-2 text-white font-sans font-medium2">
          <Image
            src="/images/greece_flag.svg"
            alt="Greek flag"
            width="20"
            height="20"
          />
          <p>{userData?.mostRecentSkill}</p>
          <BiChevronDown />
        </button>
      </div>
    </nav>
  );
};

export default DashboardSideBar;
