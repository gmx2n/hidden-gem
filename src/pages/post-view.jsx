import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { useParams } from "react-router";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export default function PostViewPage() {
  const { postId } = useParams();
  const post = useQuery(api.posts.getPost, { postId });
  const comment = useQuery(api.comments.getCommentsForPost, {
    postId,
  });

  if (!post) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Post Details</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex-1 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <div className="grid grid-cols-2 gap-2">
        <img className="w-full aspect-square object-cover rounded-lg" src="https://tinyurl.com/2uwhs8ea" alt="placeholder" />
        <img className="w-full aspect-square object-cover rounded-lg" src="https://tinyurl.com/2uwhs8ea" alt="placeholder" />
        <img className="w-full aspect-square object-cover rounded-lg" src="https://tinyurl.com/2uwhs8ea" alt="placeholder" />
        <img className="w-full aspect-square object-cover rounded-lg" src="https://tinyurl.com/2uwhs8ea" alt="add more" />
      </div>
      <p>description: {post.content}</p>

      <div className="">
        <div>comments</div>
        <CommentList postId={post._id} />
        <Authenticated>
          <div className="h-4"></div>
          <CommentForm postId={post._id} />
        </Authenticated>
      </div>
      <Unauthenticated>
        <div>you must be logged in...</div>
      </Unauthenticated>
    </div>
  );
}

function CommentList({ postId }) {
  const comments = useQuery(api.comments.getCommentsForPost, { postId });
  const deleteComment = useMutation(api.comments.deleteComment);
  return (
    <div className="flex-col">
      {comments.map((c) => (
        <div key={c._id} className="space-x-3 my-3">
          <div className="flex">
            <div className="mr-3">{c.authorName}</div>
            <div className="w-24">{"⭐".repeat(c.rating)}</div>
          </div>
          <div className="w-200">{c.content}</div>
          <div className="flex">
            <div className="grow"></div>
            <button
              className="btn btn-outline btn-xs btn-error ml-4"
              onClick={() => deleteComment({ commentId: c._id })}
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentForm({ postId }) {
  const createComment = useMutation(api.comments.createComment);
  const [rating, setRating] = useState(3);

  return (
    <div className="w-full max-w-xl bg-base-200 p-4 rounded-xl">
      <form
        className="flex flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const content = (form.elements.namedItem("content")).value;

          if (!content.trim()) return;
          try {
            await createComment({
              content,
              postId,
              rating: rating,
            });
            form.reset();
            setRating(3);
          } catch (err) {
            console.error("Failed to post comment:", err);
          }
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Your Rating:</span>
          <div className="rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <input
                key={star}
                type="radio"
                name="rating-dropdown"
                className="mask mask-star bg-orange-400"
                checked={rating === star}
                onChange={() => setRating(star)}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            name="content"
            type="text"
            placeholder="Write a comment..."
            className="input input-bordered grow"
            required
          />
          <button type="submit" className="btn btn-primary">POST</button>
        </div>
      </form>
    </div>
  );
}