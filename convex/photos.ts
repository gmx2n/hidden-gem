import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

export const addPhoto = mutation({
  args: {
    postId: v.id("post"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { postId, storageId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    return await ctx.db.insert("photo", {
      postId,
      storageId,
      uploadedBy: userId,
      uploaderName: user.email!.split("@")[0],
    });
  },
});

export const getPhotosForPost = query({
  args: { postId: v.id("post") },
  handler: async (ctx, { postId }) => {
    const photos = await ctx.db
      .query("photo")
      .withIndex("postId", (q) => q.eq("postId", postId))
      .order("desc")
      .collect();

    return await Promise.all(
      photos.map(async (photo) => ({
        _id: photo._id,
        uploaderName: photo.uploaderName,
        url: await ctx.storage.getUrl(photo.storageId),
      }))
    );
  },
});

export const getLatestPhotoForPost = query({
  args: { postId: v.id("post") },
  handler: async (ctx, { postId }) => {
    const latest = await ctx.db
      .query("photo")
      .withIndex("postId", (q) => q.eq("postId", postId))
      .order("desc")
      .first();

    if (!latest) {
      return null;
    }

    return { url: await ctx.storage.getUrl(latest.storageId) };
  },
});