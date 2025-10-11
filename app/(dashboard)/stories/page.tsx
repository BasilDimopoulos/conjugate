import { getStories } from '@/app/_services/stories';
import StoryInfo from './storyInfo';
import InitStory from './createStory';

export default async function Stories() {
  const stories = await getStories();
  return (
    <>
      <div className="container mx-auto max-w-screen-xl">
        <h1 className="text-white font-bold text-4xl capitalize mt-20">
          Stories
        </h1>
        <InitStory />

        {stories?.map((story) => (
          <div key={story.id}>
            <StoryInfo story={story} />
          </div>
        ))}
      </div>
    </>
  );
}
