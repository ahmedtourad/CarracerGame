import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getShopItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("shopItems").collect();
  },
});

export const initializeShop = mutation({
  args: {},
  handler: async (ctx) => {
    const existingItems = await ctx.db.query("shopItems").collect();
    if (existingItems.length > 0) return;

    const items = [
      // Cars
      {
        name: "Speed Racer",
        type: "car" as const,
        price: 500,
        description: "High-speed racing car with excellent acceleration",
        stats: { speed: 9, acceleration: 8, handling: 6 },
        imageUrl: "🏎️",
      },
      {
        name: "Off-Road Beast",
        type: "car" as const,
        price: 750,
        description: "Perfect for rough terrain and obstacles",
        stats: { speed: 7, acceleration: 6, handling: 9 },
        imageUrl: "🚙",
      },
      {
        name: "Lightning Bolt",
        type: "car" as const,
        price: 1000,
        description: "The fastest car in the game",
        stats: { speed: 10, acceleration: 9, handling: 7 },
        imageUrl: "⚡",
      },
      {
        name: "Tank Crusher",
        type: "car" as const,
        price: 1200,
        description: "Heavy but powerful, can push through anything",
        stats: { speed: 6, acceleration: 5, handling: 8 },
        imageUrl: "🚚",
      },
      // Characters
      {
        name: "Pro Racer",
        type: "character" as const,
        price: 300,
        description: "Professional racing driver with experience",
        stats: { speed: 7, acceleration: 7, handling: 8 },
        imageUrl: "👨‍🏁",
      },
      {
        name: "Speed Demon",
        type: "character" as const,
        price: 600,
        description: "Loves high speeds and risky maneuvers",
        stats: { speed: 9, acceleration: 8, handling: 6 },
        imageUrl: "😈",
      },
      {
        name: "Precision Driver",
        type: "character" as const,
        price: 800,
        description: "Master of perfect turns and handling",
        stats: { speed: 6, acceleration: 7, handling: 10 },
        imageUrl: "🤖",
      },
      {
        name: "All-Rounder",
        type: "character" as const,
        price: 1000,
        description: "Balanced skills in all areas",
        stats: { speed: 8, acceleration: 8, handling: 8 },
        imageUrl: "⭐",
      },
    ];

    for (const item of items) {
      await ctx.db.insert("shopItems", item);
    }
  },
});
