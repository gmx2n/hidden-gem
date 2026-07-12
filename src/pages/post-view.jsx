import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { useParams } from "react-router";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import {
  SCENERY_LABELS,
  CROWDS_LABELS,
  BEST_TIME_LABELS,
  translateRating,
  average,
} from "../lib/ratings";

export default function PostViewPage() {
  const { postId } = useParams();
  const post = useQuery(api.posts.getPost, { postId });
  const tags = useQuery(api.posts.getTagsForPost, { postId });
  const photos = useQuery(api.photos.getPhotosForPost, { postId });
  const comments = useQuery(api.comments.getCommentsForPost, { postId });
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  if (!post) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Post Details</h1>
        <p>Loading...</p>
      </div>
    );
  }

  // Average ratings across the post's own initial ratings + every review left on it.
  const sceneryAvg = average([post.scenery, ...(comments ?? []).map((c) => c.scenery)]);
  const crowdsAvg = average([post.crowds, ...(comments ?? []).map((c) => c.crowds)]);
  const bestTimeAvg = average([post.bestTime, ...(comments ?? []).map((c) => c.bestTime)]);

  return (
    <div className="container mx-auto p-4 flex-1 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

      <PhotoGrid postId={post._id} photos={photos} onSeeMore={() => setShowAllPhotos(true)} />

      {showAllPhotos && (
        <AllPhotosModal
          postId={post._id}
          photos={photos}
          onClose={() => setShowAllPhotos(false)}
        />
      )}

      <InfoBox
        tags={tags}
        sceneryAvg={sceneryAvg}
        crowdsAvg={crowdsAvg}
        bestTimeAvg={bestTimeAvg}
      />

      <p className="mt-4">description: {post.content}</p>

      <div className="mt-10">
        <div className="font-semibold mb-2">reviews:</div>
        <Authenticated>
          <ReviewForm postId={post._id} />
          <div className="h-4"></div>
        </Authenticated>
        <ReviewList postId={post._id} />
      </div>
      <Unauthenticated>
        <div>you must be logged in...</div>
      </Unauthenticated>
    </div>
  );
}

function PhotoGrid({ postId, photos, onSeeMore }) {
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const addPhoto = useMutation(api.photos.addPhoto);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        await addPhoto({ postId, storageId });
      }
    } finally {
      setUploading(false);
    }
  };

  const shown = (photos ?? []).slice(0, 5);
  const totalCount = photos?.length ?? 0;
  // Pad out to 5 cells with empty placeholders while photos are loading / sparse.
  const cells = [...shown];
  while (cells.length < 5) cells.push(null);

  return (
    <div className="grid grid-cols-3 grid-rows-2 gap-2">
      {cells.map((photo, i) =>
        photo ? (
          <img
            key={photo._id}
            className="w-full aspect-square object-cover rounded-lg"
            src={photo.url}
            alt={`photo ${i + 1}`}
          />
        ) : (
          <label
            key={`empty-${i}`}
            className="w-full aspect-square rounded-lg bg-base-200 border border-dashed border-base-300 flex items-center justify-center text-base-content/40 text-sm cursor-pointer hover:bg-base-300"
          >
            {uploading ? "Uploading..." : "+ Add Photo"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )
      )}

      {/* 6th cell: See more photos */}
      <button
        type="button"
        onClick={onSeeMore}
        className="w-full aspect-square rounded-lg bg-base-300 flex flex-col items-center justify-center gap-1 hover:bg-base-200 transition-colors"
      >
        <span className="text-2xl">📷</span>
        <span className="text-sm font-semibold text-base-content/70">
          See more photos{totalCount > 5 ? ` (${totalCount})` : ""}
        </span>
      </button>
    </div>
  );
}

function AllPhotosModal({ postId, photos, onClose }) {
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const addPhoto = useMutation(api.photos.addPhoto);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        await addPhoto({ postId, storageId });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-base-100 rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">All Photos</h2>
          <div className="flex items-center gap-2">
            <Authenticated>
              <label className="btn btn-primary btn-sm">
                {uploading ? "Uploading..." : "Add More Photos"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
            </Authenticated>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
          </div>
        </div>

        {(photos ?? []).length === 0 ? (
          <p className="text-base-content/50">No photos yet — be the first to add one!</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div key={photo._id} className="flex flex-col gap-1">
                <img
                  className="w-full aspect-square object-cover rounded-lg"
                  src={photo.url}
                  alt="post"
                />
                <span className="text-xs text-base-content/40">by {photo.uploaderName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBox({ tags, sceneryAvg, crowdsAvg, bestTimeAvg }) {
  return (
    <div className="mt-4 bg-base-200 rounded-xl p-4 flex flex-col gap-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
        <div>
          <span className="font-semibold">Scenery: </span>
          {translateRating(sceneryAvg, SCENERY_LABELS)}
        </div>
        <div>
          <span className="font-semibold">Crowds: </span>
          {translateRating(crowdsAvg, CROWDS_LABELS)}
        </div>
        <div>
          <span className="font-semibold">Best Time: </span>
          {translateRating(bestTimeAvg, BEST_TIME_LABELS)}
        </div>
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {tags.map((tag) => (
            <span key={tag} className="badge badge-accent badge-soft capitalize">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewList({ postId }) {
  const comments = useQuery(api.comments.getCommentsForPost, { postId });
  const deleteComment = useMutation(api.comments.deleteComment);

  if (!comments) return null;

  return (
    <div className="flex flex-col gap-4">
      {comments.map((c) => (
        <ReviewCard key={c._id} comment={c} onDelete={() => deleteComment({ commentId: c._id })} />
      ))}
    </div>
  );
}

function ReviewCard({ comment, onDelete }) {
  const [showReplies, setShowReplies] = useState(false);
  const replies = useQuery(
    api.comments.getRepliesForComment,
    showReplies ? { commentId: comment._id } : "skip"
  );
  const createReply = useMutation(api.comments.createCommentReply);

  return (
    <div className="bg-base-200 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{comment.authorName}</span>
        <button className="btn btn-outline btn-xs btn-error" onClick={onDelete}>x</button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        <span className="badge badge-sm">Scenery: {SCENERY_LABELS[comment.scenery]}</span>
        <span className="badge badge-sm">Crowds: {CROWDS_LABELS[comment.crowds]}</span>
        <span className="badge badge-sm">Best Time: {BEST_TIME_LABELS[comment.bestTime]}</span>
      </div>

      {comment.content && <p className="mt-2 text-sm">{comment.content}</p>}

      <button
        className="btn btn-ghost btn-xs mt-2"
        onClick={() => setShowReplies((s) => !s)}
      >
        {showReplies ? "Hide" : "View / Ask a question"}
      </button>

      {showReplies && (
        <div className="mt-2 pl-4 border-l-2 border-base-300 flex flex-col gap-2">
          {(replies ?? []).map((r) => (
            <div key={r._id} className="text-sm">
              <span className="font-semibold">{r.authorName}: </span>
              {r.content}
            </div>
          ))}
          <Authenticated>
            <form
              className="flex gap-2 mt-1"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const content = form.elements.namedItem("replyContent").value;
                if (!content.trim()) return;
                await createReply({ commentId: comment._id, content });
                form.reset();
              }}
            >
              <input
                name="replyContent"
                type="text"
                placeholder="Ask a question or leave a comment..."
                className="input input-bordered input-sm grow"
                required
              />
              <button type="submit" className="btn btn-sm btn-primary">Reply</button>
            </form>
          </Authenticated>
        </div>
      )}
    </div>
  );
}

function ReviewForm({ postId }) {
  const createComment = useMutation(api.comments.createComment);
  const [scenery, setScenery] = useState("3");
  const [crowds, setCrowds] = useState("1");
  const [bestTime, setBestTime] = useState("2");

  return (
    <div className="w-full bg-base-200 p-4 rounded-xl">
      <form
        className="flex flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const content = form.elements.namedItem("content").value;

          try {
            await createComment({
              postId,
              scenery: Number(scenery),
              crowds: Number(crowds),
              bestTime: Number(bestTime),
              content: content.trim() ? content : undefined,
            });
            form.reset();
            setScenery("3");
            setCrowds("1");
            setBestTime("2");
          } catch (err) {
            console.error("Failed to post review:", err);
          }
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Scenery</legend>
            <select value={scenery} className="select select-sm w-full" onChange={(e) => setScenery(e.target.value)}>
              {Object.entries(SCENERY_LABELS).map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Crowds</legend>
            <select value={crowds} className="select select-sm w-full" onChange={(e) => setCrowds(e.target.value)}>
              {Object.entries(CROWDS_LABELS).map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Best Time</legend>
            <select value={bestTime} className="select select-sm w-full" onChange={(e) => setBestTime(e.target.value)}>
              {Object.entries(BEST_TIME_LABELS).map(([v, label]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </fieldset>
        </div>

        <div className="flex gap-2">
          <input
            name="content"
            type="text"
            placeholder="Optional: explain your ratings..."
            className="input input-bordered grow"
          />
          <button type="submit" className="btn btn-primary">POST</button>
        </div>
      </form>
    </div>
  );
}