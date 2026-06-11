import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router";
import { useRef } from "react";

export default function HomePage() {
  const {
    results: posts,
    status,
    loadMore,
  } = usePaginatedQuery(api.posts.getPosts, {}, { initialNumItems: 12 });

  const rowRef = useRef(null);

  const scroll = (dir) => {
    rowRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero */}
      <section className="w-full px-6 py-16 md:py-24">
        <h1 className="text-5xl md:text-7xl font-bold text-primary">Where to?</h1>
        <p className="mt-3 text-base-content/50 text-lg">Explore trips from the community</p>
      </section>

      
      <section className="pb-16">
        {/* latest posts */}
        <div className="flex items-center justify-between px-6 mb-3">
          <h2 className="text-lg font-semibold text-base-content">Latest Posts</h2>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} className="btn btn-sm">‹</button>
            <button onClick={() => scroll(1)} className="btn btn-sm">›</button>
          </div>
        </div>

        {posts?.length === 0 ? (
          <p className="px-6 text-base-content/50">No posts yet — be the first to create one!</p>
        ) : (
          <div
            ref={rowRef}
            className="flex gap-4 overflow-x-auto px-6 pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {posts?.map((post) => (
              <Post key={post._id} post={post} />
            ))}
            {status === "CanLoadMore" && (
              <button
                onClick={() => loadMore(12)}
                className="flex-shrink-0 w-48 flex items-center justify-center btn btn-ghost border border-base-300 rounded-xl mb-3 h-full min-h-48"
              >
                Load more
              </button>
            )}
          </div>
        )}
        {/* add more carousels under here in same format as above */}
        <div className="flex items-center justify-between px-6 mb-3">
          <h2 className="text-lg font-semibold text-base-content">Near You</h2>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} className="btn btn-sm">‹</button>
            <button onClick={() => scroll(1)} className="btn btn-sm">›</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Post({ post }) {
  const user = useQuery(api.users.getUser);
  const deletePost = useMutation(api.posts.deletePost);

  return (
    <div className="flex-shrink-0 w-64 bg-base-200 rounded-xl overflow-hidden flex flex-col">
      {/* Color band based on difficulty */}
      <div className={`h-1.5 w-full ${post.difficulty === "hard" ? "bg-error" :
          post.difficulty === "medium" ? "bg-warning" :
            "bg-primary"
        }`} />

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h2 className="font-semibold text-base leading-snug line-clamp-2">{post.title}</h2>
        <p className="text-sm text-base-content/60 line-clamp-3 flex-1">{post.content}</p>

        {post.difficulty && (
          <span className="badge badge-sm badge-ghost capitalize">{post.difficulty}</span>
        )}

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-base-content/40">by {post.authorName}</span>
          <div className="flex gap-1">
            {post.authorId === user?._id && (
              <button
                className="btn btn-xs btn-ghost text-error"
                onClick={() => deletePost({ postId: post._id })}
              >
                Delete
              </button>
            )}
            <Link to={`/posts/${post._id}`} className="btn btn-xs btn-primary">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}