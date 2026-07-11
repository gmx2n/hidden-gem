import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  post: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    address: v.optional(v.string()),
    authorName: v.string(),
    numComments: v.optional(v.number()),
    point: v.object({ longitude: v.number(), latitude: v.number() }),
    bestTimeRating: v.optional(v.number()),
    crowdsRating: v.optional(v.number()),
    sceneryRating: v.optional(v.number()),
    imageURLs: v.optional(v.array(v.string())),
    goodReviewCount: v.optional(v.number()),
  })
    .index("by_crowds", ["crowdsRating"])
    .index("by_bestTime", ["bestTimeRating"])
    .index("by_goodReviewCount", ["goodReviewCount"]),
  comment: defineTable({
    postId: v.id("post"),
    content: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
    rating: v.optional(v.number())
  }).index("postId", ["postId"]),
  tag: defineTable({
    name: v.string()
  }),
  postTagMap: defineTable({
    postId: v.id("post"),
    tagIds: v.string()
  })
    .index("with_postId", ["postId"])
    .index("with_tagIds", ["tagIds"]),
  postImage: defineTable({
    postId: v.id("post"),
    storageId: v.id("_storage"),
  }).index("with_postId", ["postId"]),
});