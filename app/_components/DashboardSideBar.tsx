import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { BiBookAdd, BiLibrary, BiMapAlt, BiPen, BiPlus } from 'react-icons/bi';

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
            <h2 className="text-base font-medium text-white font-sans">
              Languages
            </h2>
            <button className="p-0.5 duration-200 transition-colors ">
              <BiPlus className="text-white" />
            </button>
          </div>

          <nav className="mt-4 -mx-3 space-y-3">
            {[
              { label: 'China', flag: 'china', wordsPending: 50 },
              {
                label: 'Korean',
                flag: 'korea',
                wordsPending: 20,
                active: true,
              },
              { label: 'Japanese', flag: 'japan', wordsPending: 4 },
              { label: 'Greek', flag: 'greece', wordsPending: 0 },
              { label: 'Russian', flag: 'russia', wordsPending: 10 },
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
                  <Image
                    src={`/images/${item.flag.toLowerCase()}_flag.svg`}
                    width={12}
                    height={12}
                    alt="china flag"
                  />
                  <span>{item.label}</span>
                </div>
                <p className='text-white font-light text-xs'>{item.wordsPending}</p>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSideBar;
