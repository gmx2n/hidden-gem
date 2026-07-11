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
    content: v.optional(v.string()),
    authorId: v.id("users"),
    authorName: v.string(),
    scenery: v.number(),
    crowds: v.number(),
    bestTime: v.number(),
  }).index("postId", ["postId"]),
  commentReply: defineTable({
    commentId: v.id("comment"),
    content: v.string(),
    authorId: v.id("users"),
    authorName: v.string(),
  }).index("commentId", ["commentId"]),
  photo: defineTable({
    postId: v.id("post"),
    storageId: v.id("_storage"),
    uploadedBy: v.id("users"),
    uploaderName: v.string(),
  }).index("postId", ["postId"]),
  tag: defineTable({
    name: v.string()
  }),
  postTagMap: defineTable({
    postId: v.id("post"),
    tagId: v.string()
  })
    .index("with_postId", ["postId"])
    .index("with_tagId", ["tagId"])
});