'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import {
  BiArrowToLeft,
  BiArrowToRight,
  BiCheck,
  BiChevronRight,
  BiChevronRightCircle,
  BiSolidArrowToRight,
} from 'react-icons/bi';
import Image from 'next/image';
import { Story } from '@prisma/client';

interface StoryDescriptionProps {
  story: Story;
}

export default function StoryInfo({ story }: StoryDescriptionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div
        key={story.id}
        className="mt-10 hover:cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Image
          src={story.imageUrl}
          width={450}
          height={600}
          alt="Story Image"
        ></Image>
        <h2 className="text-white font-bold text-2xl capitalize mt-5">
          {story.title}
        </h2>
      </div>

      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-gray-900/50"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden bg-[#170724] text-left shadow-xl transition-all 
             data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out 
             data-leave:duration-200 data-leave:ease-in sm:my-8 w-2/3 h-[80vh]"
            >
              <div className="flex h-full">
                {/* Left Side */}
                <div className="w-1/2 h-full pl-20 pt-32">
                  <div className="relative h-full">
                    <h2 className="text-white font-bold text-[2.6rem] capitalize mt-5">
                      {story.title}
                    </h2>
                    <p className="text-white/80 font-sans max-w-2xl leading-[1.9rem] text-lg text-left mt-2">
                      {story.description}
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-x-1.5 rounded-md bg-[#02323C] px-5 py-3 text-base font-medium text-white shadow-xs font-sans absolute bottom-16 right-10"
                    >
                      Begin Story
                      <BiSolidArrowToRight
                        aria-hidden="true"
                        className="-mr-0.5 size-5"
                      />
                    </button>
                  </div>
                </div>

                {/* Right Side with Centered Background Image */}
                <div
                  className="w-1/2 h-full bg-center bg-no-repeat bg-cover"
                  style={{
                    backgroundImage: `url('https://conjugate-filestore.s3.ap-southeast-2.amazonaws.com/scene/TheSlytherinHeir.jpg')`,
                  }}
                >
                  {/* You can overlay content here if needed */}
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
