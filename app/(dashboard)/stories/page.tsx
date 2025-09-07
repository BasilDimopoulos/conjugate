import { getStories } from '@/app/_services/stories';
import Image from 'next/image';
import StoryInfo from './storyInfo';

export default async function Stories() {
  const stories = await getStories();
  return (
    <>
      <div className="container mx-auto max-w-screen-xl">
        <h1 className="text-white font-bold text-4xl capitalize mt-20">
          Stories
        </h1>
        {stories?.map((story) => (
          <div key={story.id}>
            <StoryInfo story={story} />
          </div>
        ))}
        <ul>
          {stories.map((story) => (
            <li key={story.id}>{story.title}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
