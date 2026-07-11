import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createComment = mutation({
    args: {
        postId: v.id("post"),
        scenery: v.number(),
        crowds: v.number(),
        bestTime: v.number(),
        content: v.optional(v.string()),
    },
    handler: async (ctx, { content, postId, scenery, crowds, bestTime }) => {
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
            scenery,
            crowds,
            bestTime,
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

        const replies = await ctx.db
            .query("commentReply")
            .withIndex("commentId", (q) => q.eq("commentId", commentId))
            .collect();
        for (const reply of replies) {
            await ctx.db.delete(reply._id);
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

export const createCommentReply = mutation({
    args: {
        commentId: v.id("comment"),
        content: v.string(),
    },
    handler: async (ctx, { commentId, content }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const comment = await ctx.db.get(commentId);
        if (!comment) {
            throw new Error("Review not found");
        }

        await ctx.db.insert("commentReply", {
            commentId,
            content,
            authorId: userId,
            authorName: user.email!.split("@")[0],
        });
    },
});

export const deleteCommentReply = mutation({
    args: {
        replyId: v.id("commentReply"),
    },
    handler: async (ctx, { replyId }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        const reply = await ctx.db.get(replyId);
        if (!reply) {
            throw new Error("Reply not found");
        }

        if (reply.authorId !== userId) {
            throw new Error("Not authorized to delete this reply");
        }

        await ctx.db.delete(replyId);
    },
});

export const getRepliesForComment = query({
    args: { commentId: v.id("comment") },
    handler: async (ctx, { commentId }) => {
        return await ctx.db
            .query("commentReply")
            .withIndex("commentId", (q) => q.eq("commentId", commentId))
            .order("asc")
            .collect();
    },
});