import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { BiLibrary, BiMapAlt, BiPen } from 'react-icons/bi';

const DashboardSideBar: React.FC = () => {
  const iconStyle = 'text-white/80 size-[1.28rem]';
  return (
    <aside className="flex flex-col w-64 h-screen px-5 py-8 overflow-y-auto bg-appBg pl-8 font-sans uppercase">
      <Link href="/app" className="mt-12">
        <Image
          src="/images/conjugate.svg"
          width={120}
          height={120}
          alt="revlit logo"
        />
      </Link>

      <div className="flex flex-col justify-between flex-1 mt-6">
        <nav className="-mx-3 space-y-3">
          {[
            {
              label: 'Stories',
              icon: <BiMapAlt className={iconStyle} />,
              path: '/stories',
            },
            {
              label: 'Learn',
              icon: <BiLibrary className={iconStyle} />,
              path: '/learn',
            },
            {
              label: 'Review',
              icon: <BiPen className={iconStyle} />,
              path: '/review',
            },
          ].map((item, index) => (
            <Link
              key={index}
              className="flex items-center px-3 py-2 text-white/80 transition-colors duration-300 transform rounded-lg hover:bg-gray-100 hover:text-gray-700"
              href={item.path}
            >
              {item.icon}
              <span className="mx-2 text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">Maps</h2>
            <button className="p-0.5 hover:bg-gray-100 duration-200 transition-colors text-gray-500 border rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
          </div>

          <nav className="mt-4 -mx-3 space-y-3">
            {[
              { label: 'Korea', color: 'bg-pink-500' },
              { label: 'Gender', color: 'bg-slate-500', active: true },
              { label: 'Julia Gillard', color: 'bg-indigo-500' },
              { label: 'Three Days Grace', color: 'bg-blue-500' },
              { label: 'UI Components', color: 'bg-yellow-500' },
            ].map((item, index) => (
              <button
                key={index}
                className={`flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-gray-600 transition-colors duration-300 transform rounded-lg ${
                  item.active
                    ? 'bg-gray-100 text-gray-700 '
                    : ' hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-x-2">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span>{item.label}</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4 rtl:rotate-180"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSideBar;
