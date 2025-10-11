import { getStoryById } from '@/app/_services/stories';
import Image from 'next/image';
import Link from 'next/link';

interface StoryPageProps {
  params: { id: string };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = params;
  const storyDetails = await getStoryById(id);

  return (
    <div>
      {storyDetails ? (
        <div className="container mx-auto max-w-2xl mt-20">
          <Image
            src={storyDetails?.imageUrl}
            width={450}
            height={600}
            alt="Story Image"
            className="rounded-md"
          ></Image>
          <h2 className="text-3xl mt-5">{storyDetails.title}</h2>
          <p className="">{storyDetails.description}</p>
          <Link href={'/game'}>Read!</Link>
        </div>
      ) : (
        <p>Story not found.</p>
      )}
    </div>
  );
}
