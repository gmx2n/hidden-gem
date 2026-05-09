import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    address: v.string()
  },
  handler: async (ctx, { title, content, address }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const post = {
      title,
      content,
      authorId: userId,
      authorName: user.email!.split("@")[0], 
      point: {longitude: 0.0, latitude: 0.0}, 
      address,  // Use the part of the email before the "@" as the author name
    };
    await ctx.db.insert("post", post);
  },
});



export const getPosts = query({
  args: {
    // paginationOptsValidator needs to be imported from convex/server
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { paginationOpts }) => {
    return await ctx.db.query("post").order("desc").paginate(paginationOpts);
  },
});


export const deletePost = mutation({
  args: {
    postId: v.id("post"),
  },
  handler: async (ctx, { postId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.authorId !== userId) {
      throw new Error("Not authorized to delete this post");
    }

    await ctx.db.delete(postId);
  },
});

export const getPost = query({
  args: {
    postId: v.id("post"),
  },
  handler: async (ctx, { postId }) => {
    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    return post;
  },
});