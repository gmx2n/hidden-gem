import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  post: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
    numComments: v.optional(v.number()),
    point: v.object({ longitude: v.number(), latitude: v.number() }),
    difficulty: v.optional(v.number()),
    scenery: v.optional(v.number()),
    crowds: v.optional(v.number()),
    bestTime: v.optional(v.number()),
    overall: v.optional(v.number()),
    address: v.optional(v.string()),
  }),
  comment: defineTable({
    postId: v.id("post"),
    content: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
    rating: v.optional(v.number())
  }).index("postId", ["postId"]),
});