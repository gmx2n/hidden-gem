import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const createPost = mutation({
  args: {
    postData: v.object({
      title: v.string(),
      content: v.string(),
      address: v.string(),
      scenery: v.number(),
      crowds: v.number(),
      bestTime: v.number(),
      tagIds: v.array(v.string())
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const post = {
      ...args.postData,
      authorId: userId,
      authorName: user.email!.split("@")[0],
      point: { longitude: 0.0, latitude: 0.0 },
    };

    const postId = await ctx.db.insert("post", post);

    for (let tagId of args.postData.tagIds) {
      await ctx.db.insert("postTagMap", {
        postId, tagId
      })
    }

    return postId;
  },
});

export const getPosts = query({
  args: {
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

export const getTagsForPost = query({
  args: {
    postId: v.id("post"),
  },
  handler: async (ctx, { postId }) => {
    const links = await ctx.db
      .query("postTagMap")
      .withIndex("with_postId", (q) => q.eq("postId", postId))
      .collect();
    return links.map((l) => l.tagId);
  },
});

export const getLatestPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("post").order("desc").take(10);
  },
});

export const getTrulyHiddenPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("post").order("desc").collect();
    return posts.filter((p) => p.crowds === 1).slice(0, 20);
  },
});

export const getSunsetPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("post").order("desc").collect();
    return posts.filter((p) => p.bestTime === 4).slice(0, 20);
  },
});

export const getPopularPosts = query({
  args: {},
  handler: async (ctx) => {
    const allComments = await ctx.db.query("comment").collect();

    const goodReviewCounts = new Map();
    for (const c of allComments) {
      const avg = (c.scenery + c.crowds + c.bestTime) / 3;
      if (avg > 3.5) {
        goodReviewCounts.set(c.postId, (goodReviewCounts.get(c.postId) || 0) + 1);
      }
    }

    const topPostIds = [...goodReviewCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([postId]) => postId);

    const posts = await Promise.all(topPostIds.map((id) => ctx.db.get(id)));
    return posts.filter((p) => p !== null);
  },
});