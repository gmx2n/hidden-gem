import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router";
import { useState } from "react";

export default function PostForm() {
  const createPost = useMutation(api.posts.createPost);
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState([]);
  const [scenery, setScenery] = useState("3");
  const [crowds, setCrowds] = useState("1"); // Defaulting to "1" (Empty)
  const [bestTime, setBestTime] = useState("2"); // Defaulting to "2" (Morning)
  const tagsList = [
    "sunny", "cloudy", "rainy", "cold at night", "difficult to find",
    "beware of animals", "beware of bugs", "good for stargazing", "good for birdwatching", "good for rock climbing",
    "waterfall", "swimming spot", "desert", "woodland", "meadow"
  ];

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag) // Remove if already selected
        : [...prev, tag] // Add if not selected
    );
  };


  return (
    <div className="flex flex-col items-center p-5 h-screen">
      <div className="text-xl font-bold"> Post a Hidden Gem </div>
      <div className="text-xs text-gray-500"> Share your secret spots </div>
      <div className="bg-base-300 w-5/6 m-3 rounded-xl border-neutral">
        <form
          className="flex space-y-4 flex-col p-3 justify-center"
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const postId = await createPost({
              postData: {
                title: formData.get("title"),
                address: formData.get("address") || "Unknown Location",
                content: formData.get("description"),
                scenery: Number(scenery),
                crowds: Number(crowds),
                bestTime: Number(bestTime),
              }
            });

            navigate(`/posts/${postId}`);

          }}
        >
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Title</legend>
            <input type="text" className="input w-full" name="title" required />
          </fieldset>

          <legend className="">Photos</legend>
          <input type="file" className="file-input" />

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Description</legend>
            <textarea className="textarea w-full" name="description" rows={4} required />
          </fieldset>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-1">

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Scenery Rating</legend>
              <select
                value={scenery}
                className="select w-full"
                onChange={(e) => setScenery(e.target.value)}
              >
                <option value="1">Boring</option>
                <option value="2">Decent</option>
                <option value="3">Nice</option>
                <option value="4">Beautiful</option>
                <option value="5">Breathtaking</option>
              </select>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Crowd Density</legend>
              <select
                value={crowds}
                className="select w-full"
                onChange={(e) => setCrowds(e.target.value)}
              >
                <option value="1">Empty</option>
                <option value="2">Some People</option>
                <option value="3">Crowded</option>
              </select>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-legend">Best Time to Visit</legend>
              <select
                value={bestTime}
                className="select w-full"
                onChange={(e) => setBestTime(e.target.value)}
              >
                <option value="1">Sunrise</option>
                <option value="2">Morning</option>
                <option value="3">Afternoon</option>
                <option value="4">Sunset</option>
                <option value="5">Midnight</option>
              </select>
            </fieldset>

          </div>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Tags (select tags that apply)</legend>
            <div className="flex flex-wrap gap-2">
              {tagsList.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`btn btn-xs transition-colors ${isSelected
                      ? 'bg-primary text-primary-content border-primary' // Highlighted styles (adjust to your framework)
                      : 'bg-base-200 text-base-content' // Default unselected styles
                      }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </fieldset>


          <button type="submit" className="btn btn-primary w-full mt-4">
            Create Post
          </button>
        </form>
      </div>
    </div>
  );
}