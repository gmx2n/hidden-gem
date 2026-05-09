import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router";

export default function HomePage() {
  const {
    results: posts,
    status,
    loadMore,
  } = usePaginatedQuery(api.posts.getPosts, {}, { initialNumItems: 3 });

  return (
    <div className="container mx-auto p-4">
      <section
        class="relative"
        style={{ backgroundImage: "url('https://example.com')" }}
      >
        <div class="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-24 lg:py-32">
          <div class="grid grid-cols-1 items-center gap-8 sm:gap-20 lg:grid-cols-2">
            <div class="max-w-180">
              <h1 class="mb-3 pb-4 text-4xl font-bold text-primary md:text-6xl">
                Where to?
              </h1>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search"
                  className="input input-bordered w-36 md:w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="text-lg grid grid-cols-3 text-gray-600 mb-8">
        {posts?.length === 0 &&
          "WELCOME! There are no posts yet. Be the first one to create a post!"}
        {posts?.map((post) => (
          <Post key={post._id} post={post} />
        ))}
      </div>
      {status === "CanLoadMore" && (
        <button onClick={() => loadMore(15)} className="btn btn-sm btn-primary">
          Load More
        </button>
      )}
    </div>
  );
}

function Post({ post }) {
  const user = useQuery(api.users.getUser);
  const deletePost = useMutation(api.posts.deletePost);

  return (
    <div className="mb-4 m-1 p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">{post.title}</h2>
      <p className="text-gray-700 mb-2">{post.content}</p>
      <div className="flex items-end">
        <span className="text-sm text-gray-500">By {post.authorName}</span>
        <div className="grow"></div>
        {post.authorId === user?._id && (
          <button
            className="btn btn-xs btn-error"
            onClick={() => deletePost({ postId: post._id })}
          >
            Delete
          </button>
        )}
        <Link to={`/posts/${post._id}`} className="btn btn-xs ml-2 btn-primary">
          View Details
        </Link>
      </div>
    </div>
  );
}
