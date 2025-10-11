import Image from 'next/image';
import { Story } from '@prisma/client';
import Link from 'next/link';

interface StoryDescriptionProps {
  story: Story;
}

export default function StoryInfo({ story }: StoryDescriptionProps) {
  return (
    <div>
      <Link
        href={`/stories/${story.id}`}
        key={story.id}
        className="mt-8 hover:cursor-pointer w-fit"
      >
        <Image
          src={story.imageUrl}
          width={450}
          height={600}
          alt="Story Image"
          className="rounded-md"
        ></Image>
        <h2 className="text-white font-light text-xl mt-3 font-sans uppercase tracking-wide">
          {story.title}
        </h2>
      </Link>
    </div>
  );
}
