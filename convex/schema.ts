import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  players: defineTable({
    userId: v.id("users"),
    name: v.string(),
    points: v.number(),
    selectedCar: v.string(),
    selectedCharacter: v.string(),
    ownedCars: v.array(v.string()),
    ownedCharacters: v.array(v.string()),
  }).index("by_user", ["userId"]),

  races: defineTable({
    name: v.string(),
    mapId: v.string(),
    hostId: v.id("users"),
    players: v.array(v.object({
      playerId: v.id("players"),
      name: v.string(),
      position: v.object({ x: v.number(), y: v.number() }),
      lap: v.number(),
      finished: v.boolean(),
      rank: v.optional(v.number()),
      isAI: v.boolean(),
    })),
    status: v.union(v.literal("waiting"), v.literal("racing"), v.literal("finished")),
    maxPlayers: v.number(),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  }).index("by_status", ["status"]),

  maps: defineTable({
    name: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    trackData: v.object({
      checkpoints: v.array(v.object({ x: v.number(), y: v.number() })),
      startPosition: v.object({ x: v.number(), y: v.number() }),
      obstacles: v.array(v.object({ x: v.number(), y: v.number(), width: v.number(), height: v.number() })),
    }),
    unlocked: v.boolean(),
  }),

  shopItems: defineTable({
    name: v.string(),
    type: v.union(v.literal("car"), v.literal("character")),
    price: v.number(),
    description: v.string(),
    stats: v.object({
      speed: v.number(),
      acceleration: v.number(),
      handling: v.number(),
    }),
    imageUrl: v.string(),
  }),

  bluetoothConnections: defineTable({
    hostId: v.id("users"),
    guestId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
    raceId: v.optional(v.id("races")),
  }).index("by_host", ["hostId"])
    .index("by_guest", ["guestId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
