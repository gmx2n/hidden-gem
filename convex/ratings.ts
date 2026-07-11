import { MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function recalculatePostOverall(
    ctx: MutationCtx,
    postId: Id<"post">
) {
    const post = await ctx.db.get(postId);
    if (!post) return;

    const comments = await ctx.db
        .query("comment")
        .withIndex("postId", (q) => q.eq("postId", postId))
        .collect();

    const ratingSets = [
        { scenery: post.scenery, crowds: post.crowds, bestTime: post.bestTime },
        ...comments.map((c) => ({
            scenery: c.scenery,
            crowds: c.crowds,
            bestTime: c.bestTime,
        })),
    ];

    let sum = 0;
    let count = 0;
    for (const r of ratingSets) {
        for (const value of [r.scenery, r.crowds, r.bestTime]) {
            if (value !== undefined) {
                sum += value;
                count += 1;
            }
        }
    }

    await ctx.db.patch(postId, {
        overall: count > 0 ? sum / count : undefined,
        numComments: comments.length,
    });
}