import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

export default function PostForm() {
  const createPost = useMutation(api.posts.createPost);
  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const navigate = useNavigate();

  const [selectedTags, setSelectedTags] = useState([]);
  const [scenery, setScenery] = useState("3");
  const [crowds, setCrowds] = useState("1");
  const [bestTime, setBestTime] = useState("2");
  const [photoFiles, setPhotoFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tagsList = [
    "sunny", "cloudy", "rainy", "cold at night", "difficult to find",
    "beware of animals", "beware of bugs", "good for stargazing",
    "good for birdwatching", "good for rock climbing", "waterfall",
    "swimming spot", "desert", "woodland", "meadow"
  ];

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    setPhotoFiles(files);

    const objectUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews(objectUrls);
  };

  const removePhoto = (indexToRemove) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[indexToRemove]);

    setPhotoFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setPreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="flex flex-col items-center p-5 overflow-y-auto">
      <div className="text-xl font-bold"> Post a Hidden Gem </div>
      <div className="text-xs text-gray-500"> Share your secret spots </div>
      <div className="bg-base-300 w-5/6 m-3 rounded-xl border-neutral">
        <form
          className="flex space-y-4 flex-col p-3 justify-center"
          onSubmit={async (e) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            setIsSubmitting(true);

            try {
              const imageStorageIds = [];
              for (const file of photoFiles) {
                const uploadUrl = await generateUploadUrl();
                const result = await fetch(uploadUrl, {
                  method: "POST",
                  headers: { "Content-Type": file.type },
                  body: file,
                });
                const { storageId } = await result.json();
                imageStorageIds.push(storageId);
              }

              const postId = await createPost({
                postData: {
                  title: formData.get("title"),
                  content: formData.get("description"),
                  sceneryRating: Number(scenery),
                  crowdsRating: Number(crowds),
                  bestTimeRating: Number(bestTime),
                  tagIds: selectedTags,
                  address: formData.get("address") || "Unknown Location",
                },
                tagIds: selectedTags,
                imageStorageIds,
              });

              navigate(`/posts/${postId}`);
            } catch (error) {
              console.error("Failed to create post:", error);
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Title</legend>
            <input type="text" className="input w-full" name="title" required />
          </fieldset>

          <div>
            <legend className="mb-2 block font-medium">Photos</legend>
            <input
              type="file"
              className="file-input w-full"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />

            {/* Photo Previews Grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {previews.map((url, index) => (
                  <div key={url} className="relative group aspect-square rounded-lg overflow-hidden bg-base-100">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-error text-error-content rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-90 hover:opacity-100 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photoFiles.length > 0 && (
              <p className="text-xs text-base-content/50 mt-1">
                {photoFiles.length} photo{photoFiles.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Description</legend>
            <textarea
              className="textarea w-full"
              name="description"
              rows={4}
              required
            />
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
                      ? "bg-primary text-primary-content border-primary"
                      : "bg-base-200 text-base-content"
                      }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button
            type="submit"
            className="btn btn-primary w-full mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
