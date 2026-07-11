import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router";
import { useRef } from "react";

export default function HomePage() {
  const latestPosts = useQuery(api.posts.getLatestPosts);
  const trulyHiddenPosts = useQuery(api.posts.getTrulyHiddenPosts);
  const sunsetPosts = useQuery(api.posts.getSunsetPosts);
  const popularPosts = useQuery(api.posts.getPopularPosts);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero */}
      <section className="w-full px-6 py-16 md:py-24">
        <h1 className="text-5xl md:text-7xl font-bold text-primary">Where to?</h1>
        <p className="mt-3 text-base-content/50 text-lg">Explore hidden spots from the community</p>
        <button className="btn">See All Posts</button>
      </section>

      <section className="pb-16">
        <Carousel
          title="Latest Posts"
          posts={latestPosts}
          emptyMessage="No posts yet — be the first to create one!"
        />

        <Carousel
          title="Truly Hidden"
          posts={trulyHiddenPosts}
          emptyMessage="No truly empty spots found yet."
        />

        <Carousel
          title="Sunset Spots"
          posts={sunsetPosts}
          emptyMessage="No sunset spots found yet."
        />

        <Carousel
          title="Popular"
          posts={popularPosts}
          emptyMessage="No popular spots yet — leave some great reviews!"
        />
      </section>
    </div>
  );
}

function Carousel({ title, posts, emptyMessage }) {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    rowRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between px-6 mb-3">
        <h2 className="text-lg font-semibold text-base-content">{title}</h2>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} className="btn btn-sm">‹</button>
          <button onClick={() => scroll(1)} className="btn btn-sm">›</button>
        </div>
      </div>

      {posts?.length === 0 ? (
        <p className="px-6 text-base-content/50">{emptyMessage}</p>
      ) : (
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto px-6 pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {posts?.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function Post({ post }) {
  const user = useQuery(api.users.getUser);
  const deletePost = useMutation(api.posts.deletePost);
  const latestPhoto = useQuery(api.photos.getLatestPhotoForPost, { postId: post._id });

  return (
    <div className="flex-shrink-0 w-64 bg-base-200 rounded-xl overflow-hidden flex flex-col">
      {/* Color band based on difficulty */}
      <div className={`h-1.5 w-full ${post.difficulty === "hard" ? "bg-error" :
        post.difficulty === "medium" ? "bg-warning" :
          "bg-primary"
        }`} />

      {latestPhoto?.url && (
        <img
          src={latestPhoto.url}
          alt={post.title}
          className="w-full h-32 object-cover"
        />
      )}

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