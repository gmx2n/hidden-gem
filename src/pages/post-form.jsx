import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router";

export default function PostForm() {
  const createPost = useMutation(api.posts.createPost);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form
        className="flex flex-col space-y-4 w-full max-w-md"
        onSubmit={async (e) => {
          e.preventDefault();
          await createPost({
            title: e.currentTarget.title.value,
            content: e.currentTarget.content.value,
            address: e.currentTarget.address.value,
          });
          navigate("/");
        }}
      >
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Title</legend>
          <input type="text" className="input" name="title" />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Content</legend>
          <textarea className="textarea" name="content" rows={4} />
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">Address</legend>
          <textarea className="textarea" name="address" rows={4} />
        </fieldset>

        <button type="submit" className="btn btn-primary">
          Create Post
        </button>
      </form>
    </div>
  );
}
