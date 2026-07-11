import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
const GOOD_REVIEW_THRESHOLD = 3.5;

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

        const user = await ctx.db.get("users", userId);
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

        if (rating > GOOD_REVIEW_THRESHOLD) {
            const post = await ctx.db.get("post", postId);
            if (post) {
                await ctx.db.patch("post", postId, {
                    goodReviewCount: (post.goodReviewCount ?? 0) + 1,
                });
            }
        }
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

        const comment = await ctx.db.get("comment", commentId);
        if (!comment) {
            throw new Error("Comment not found");
        }

        if (comment.authorId !== userId) {
            throw new Error("Not authorized to delete this Comment");
        }

        await ctx.db.delete("comment", commentId);

        if ((comment.rating ?? 0) > GOOD_REVIEW_THRESHOLD) {
            const post = await ctx.db.get("post", comment.postId);
            if (post) {
                await ctx.db.patch("post", comment.postId, {
                    goodReviewCount: Math.max(0, (post.goodReviewCount ?? 0) - 1),
                });
            }
        }
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