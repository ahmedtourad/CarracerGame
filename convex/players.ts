import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getOrCreatePlayer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    let player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!player) {
      const user = await ctx.db.get(userId);
      const playerId = await ctx.db.insert("players", {
        userId,
        name: user?.name || "Player",
        points: 0,
        selectedCar: "default",
        selectedCharacter: "default",
        ownedCars: ["default"],
        ownedCharacters: ["default"],
      });
      player = await ctx.db.get(playerId);
    }

    return player;
  },
});

export const updatePlayerName = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (player) {
      await ctx.db.patch(player._id, { name: args.name });
    }
  },
});

export const purchaseItem = mutation({
  args: { itemId: v.id("shopItems") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!player) throw new Error("Player not found");

    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    if (player.points < item.price) {
      throw new Error("Not enough points");
    }

    const updates: any = { points: player.points - item.price };

    if (item.type === "car") {
      if (player.ownedCars.includes(item.name)) {
        throw new Error("Already owned");
      }
      updates.ownedCars = [...player.ownedCars, item.name];
    } else {
      if (player.ownedCharacters.includes(item.name)) {
        throw new Error("Already owned");
      }
      updates.ownedCharacters = [...player.ownedCharacters, item.name];
    }

    await ctx.db.patch(player._id, updates);
  },
});

export const selectItem = mutation({
  args: { 
    type: v.union(v.literal("car"), v.literal("character")),
    itemName: v.string() 
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!player) throw new Error("Player not found");

    const owned = args.type === "car" ? player.ownedCars : player.ownedCharacters;
    if (!owned.includes(args.itemName)) {
      throw new Error("Item not owned");
    }

    const updates = args.type === "car" 
      ? { selectedCar: args.itemName }
      : { selectedCharacter: args.itemName };

    await ctx.db.patch(player._id, updates);
  },
});
