import { prisma } from '@/utils/db';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { BiChevronDown } from 'react-icons/bi';
import { getUser } from '../_services/user';
import { User, UsersSkills } from '@prisma/client';

interface SkillsButton {
  user: Partial<User>;
}

const DashboardSideBar: React.FC = async () => {
  const currentUser = await getUser();
  const userData = await prisma.user.findFirst({
    where: { clerkId: currentUser },
  });
  console.log("userData: ", userData)

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
      <SkillsButton user={userData || {}} />
    </nav>
  );
};

const SkillsButton = async (props: SkillsButton) => {
  const user = props.user;
  const usersSkills = await prisma.usersSkills.findMany({
    where: { userId: user.id },
    include: {
      skill: true
    }
  });
  const mostRecentSkill = usersSkills.find(
    (skill: UsersSkills) => skill.skillId === user?.mostRecentSkill
  )?.skill;
  console.log('usersSkills: ', usersSkills);
  console.log('mostRecentSkill: ', mostRecentSkill?.skill);
  return (
    <div className="flex items-center gap-x-8">
      <button className="flex items-center gap-x-2 text-white font-sans font-medium2">
        <Image
          src="/images/greece_flag.svg"
          alt="Greek flag"
          width="20"
          height="20"
        />
        <p className='capitalize'>{mostRecentSkill?.name}</p>
        <BiChevronDown />
      </button>
    </div>
  );
};

export default DashboardSideBar;
