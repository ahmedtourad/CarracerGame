import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAllMaps = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("maps").collect();
  },
});

export const initializeMaps = mutation({
  args: {},
  handler: async (ctx) => {
    const existingMaps = await ctx.db.query("maps").collect();
    if (existingMaps.length > 0) return;

    const maps = [
      {
        name: "Desert Circuit",
        description: "A fast desert track with wide turns",
        difficulty: "easy" as const,
        trackData: {
          checkpoints: [
            { x: 200, y: 100 },
            { x: 400, y: 200 },
            { x: 300, y: 400 },
            { x: 100, y: 300 },
          ],
          startPosition: { x: 100, y: 100 },
          obstacles: [
            { x: 250, y: 250, width: 50, height: 50 },
            { x: 350, y: 150, width: 30, height: 30 },
          ],
        },
        unlocked: true,
      },
      {
        name: "City Streets",
        description: "Navigate through busy city streets",
        difficulty: "medium" as const,
        trackData: {
          checkpoints: [
            { x: 150, y: 100 },
            { x: 350, y: 150 },
            { x: 400, y: 350 },
            { x: 200, y: 400 },
            { x: 50, y: 250 },
          ],
          startPosition: { x: 100, y: 100 },
          obstacles: [
            { x: 200, y: 200, width: 40, height: 40 },
            { x: 300, y: 300, width: 60, height: 20 },
            { x: 150, y: 350, width: 30, height: 50 },
          ],
        },
        unlocked: true,
      },
      {
        name: "Mountain Pass",
        description: "Dangerous mountain roads with sharp turns",
        difficulty: "hard" as const,
        trackData: {
          checkpoints: [
            { x: 180, y: 80 },
            { x: 380, y: 120 },
            { x: 420, y: 320 },
            { x: 250, y: 450 },
            { x: 80, y: 380 },
            { x: 60, y: 180 },
          ],
          startPosition: { x: 100, y: 100 },
          obstacles: [
            { x: 220, y: 180, width: 80, height: 30 },
            { x: 320, y: 280, width: 40, height: 80 },
            { x: 150, y: 320, width: 50, height: 40 },
            { x: 380, y: 200, width: 30, height: 60 },
          ],
        },
        unlocked: false,
      },
      {
        name: "Speedway",
        description: "High-speed oval track",
        difficulty: "easy" as const,
        trackData: {
          checkpoints: [
            { x: 300, y: 100 },
            { x: 400, y: 250 },
            { x: 300, y: 400 },
            { x: 100, y: 250 },
          ],
          startPosition: { x: 100, y: 100 },
          obstacles: [],
        },
        unlocked: true,
      },
      {
        name: "Forest Trail",
        description: "Winding path through dense forest",
        difficulty: "medium" as const,
        trackData: {
          checkpoints: [
            { x: 160, y: 120 },
            { x: 280, y: 180 },
            { x: 380, y: 280 },
            { x: 320, y: 420 },
            { x: 180, y: 380 },
            { x: 80, y: 240 },
          ],
          startPosition: { x: 100, y: 100 },
          obstacles: [
            { x: 200, y: 150, width: 25, height: 25 },
            { x: 300, y: 220, width: 35, height: 35 },
            { x: 250, y: 350, width: 30, height: 30 },
            { x: 120, y: 300, width: 40, height: 20 },
          ],
        },
        unlocked: false,
      },
    ];

    for (const map of maps) {
      await ctx.db.insert("maps", map);
    }
  },
});
