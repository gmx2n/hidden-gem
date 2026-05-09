import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createComment = mutation({
    args: {
        content: v.string(),
        postId: v.id("post"),
        rating: v.number()
    },
    handler: async (ctx, { content, postId, rating }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.insert("comment", {
            authorId: userId,
            authorName: user.email!.split("@")[0],
            content,
            postId,
            rating, 
        });
    },
});

export const deleteComment = mutation({
    args: {
        commentId: v.id("comment"),
    },
    handler: async (ctx, { commentId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const comment = await ctx.db.get(commentId);
        if (!comment) {
            throw new Error("Comment not found");
        }

        if (comment.authorId !== userId) {
            throw new Error("Not authorized to delete this Comment");
        }

        await ctx.db.delete(commentId);
    },
});

export const getCommentsForPost = query({
    args: { postId: v.id("post") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("comment")
            .withIndex("postId", (q) => q.eq("postId", args.postId))
            .order("asc")
            .collect();
    },
});
