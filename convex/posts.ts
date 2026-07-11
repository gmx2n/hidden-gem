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
      sceneryRating: v.number(),
      crowdsRating: v.number(),
      bestTimeRating: v.number()
    }),
    tagIds: v.array(v.id("with_postId")),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get("users", userId);
    if (!user) {
      throw new Error("User not found");
    }

    const post = {
      ...args.postData,
      authorId: userId,
      authorName: user.email!.split("@")[0],
      point: { longitude: 0.0, latitude: 0.0 },
      goodReviewCount: 0,
    };

    const postId = await ctx.db.insert("post", post);

    // TODO: create geoIndex

    // TODO: connect to tags

    for (const storageId of args.imageStorageIds ?? []) {
      await ctx.db.insert("postImage", { postId, storageId });
    }

    return postId;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
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

export const getLatestPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("post").order("desc").take(10);
  },
});

export const getTrulyHiddenPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("post")
      .withIndex("by_crowds", (q) => q.eq("crowdsRating", 1))
      .order("desc")
      .take(10);
  },
});

export const getSunsetSpotPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("post")
      .withIndex("by_bestTime", (q) => q.eq("bestTimeRating", 4))
      .order("desc")
      .take(10);
  },
});

export const getPopularPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("post")
      .withIndex("by_goodReviewCount", (q) => q.gt("goodReviewCount", 0))
      .order("desc")
      .take(10);
  },
});

export const getLatestPostImage = query({
  args: {
    postId: v.id("post"),
  },
  handler: async (ctx, { postId }) => {
    const image = await ctx.db
      .query("postImage")
      .withIndex("with_postId", (q) => q.eq("postId", postId))
      .order("desc")
      .first();

    if (!image) {
      return null;
    }

    return await ctx.storage.getUrl(image.storageId);
  },
});

export const getPostImages = query({
  args: {
    postId: v.id("post"),
  },
  handler: async (ctx, { postId }) => {
    const images = await ctx.db
      .query("postImage")
      .withIndex("with_postId", (q) => q.eq("postId", postId))
      .order("asc")
      .take(20);

    const withUrls = await Promise.all(
      images.map(async (image) => ({
        _id: image._id,
        url: await ctx.storage.getUrl(image.storageId),
      }))
    );

    return withUrls.filter((image) => image.url !== null);
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

    const post = await ctx.db.get("post", postId);
    if (!post) {
      throw new Error("Post not found");
    }

    if (post.authorId !== userId) {
      throw new Error("Not authorized to delete this post");
    }

    await ctx.db.delete("post", postId);
  },
});

export const getPost = query({
  args: {
    postId: v.id("post"),
  },
  handler: async (ctx, { postId }) => {
    const post = await ctx.db.get("post", postId);
    if (!post) {
      throw new Error("Post not found");
    }
    return post;
  },
});