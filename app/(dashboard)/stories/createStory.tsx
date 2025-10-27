// Unused imports and variables - keeping for potential future use
// import { currentUser } from '@clerk/nextjs/server';

export default async function InitStory() {
  // Unused variable - keeping for potential future use
  // const user = await currentUser();
//   createStoryArcForUser(
//     user?.id || '',
//     '4ef2ac49-6f52-4fec-8313-aabb19b46097',
//     storyDetails
//   );
  return (
    <div>
      {/* <p>{user.id}</p> */}
      {/* <p
        className="inline-flex items-center gap-x-1.5 rounded-md bg-[#02323C] px-5 py-3 text-base font-medium text-white shadow-xs font-sans absolute bottom-16 right-10"
        onClick={() => {
          createStoryArcForUser(
            user?.id || '',
            '4ef2ac49-6f52-4fec-8313-aabb19b46097',
            storyDetails
          );
        }}
      >
        Begin Story
        <BiSolidRightArrowCircle
          aria-hidden="true"
          className="-mr-0.5 size-5"
        />
      </p> */}
    </div>
  );
}