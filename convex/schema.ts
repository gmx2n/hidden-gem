import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables, post: defineTable({
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
    numComments: v.optional(v.number()), 
    point: v.object({longitude: v.number(), latitude: v.number()}),
    address: v.string() // ADD THIS LINE
  }),
  comment: defineTable({
    postId: v.id("post"),
    content: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
    rating: v.optional(v.number())
  }).index("postId", ["postId"]),
});

