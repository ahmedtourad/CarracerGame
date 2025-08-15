import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createRace = mutation({
  args: { 
    name: v.string(),
    mapId: v.string(),
    maxPlayers: v.number(),
    withAI: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!player) throw new Error("Player not found");

    const players = [{
      playerId: player._id,
      name: player.name,
      position: { x: 100, y: 100 },
      lap: 0,
      finished: false,
      isAI: false,
    }];

    // Add AI players if requested
    if (args.withAI) {
      const aiNames = ["Speed Demon", "Turbo", "Lightning", "Racer X", "Velocity"];
      for (let i = 0; i < Math.min(5, args.maxPlayers - 1); i++) {
        players.push({
          playerId: player._id, // Placeholder for AI
          name: aiNames[i],
          position: { x: 100 + (i + 1) * 50, y: 100 },
          lap: 0,
          finished: false,
          isAI: true,
        });
      }
    }

    return await ctx.db.insert("races", {
      name: args.name,
      mapId: args.mapId,
      hostId: userId,
      players,
      status: "waiting",
      maxPlayers: args.maxPlayers,
    });
  },
});

export const joinRace = mutation({
  args: { raceId: v.id("races") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!player) throw new Error("Player not found");

    const race = await ctx.db.get(args.raceId);
    if (!race) throw new Error("Race not found");

    if (race.status !== "waiting") {
      throw new Error("Race already started");
    }

    if (race.players.length >= race.maxPlayers) {
      throw new Error("Race is full");
    }

    const isAlreadyJoined = race.players.some(p => p.playerId === player._id && !p.isAI);
    if (isAlreadyJoined) {
      throw new Error("Already joined");
    }

    const newPlayer = {
      playerId: player._id,
      name: player.name,
      position: { x: 100 + race.players.length * 50, y: 100 },
      lap: 0,
      finished: false,
      isAI: false,
    };

    await ctx.db.patch(args.raceId, {
      players: [...race.players, newPlayer],
    });
  },
});

export const startRace = mutation({
  args: { raceId: v.id("races") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const race = await ctx.db.get(args.raceId);
    if (!race) throw new Error("Race not found");

    if (race.hostId !== userId) {
      throw new Error("Only host can start race");
    }

    await ctx.db.patch(args.raceId, {
      status: "racing",
      startTime: Date.now(),
    });
  },
});

export const updatePlayerPosition = mutation({
  args: { 
    raceId: v.id("races"),
    position: v.object({ x: v.number(), y: v.number() }),
    lap: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db
      .query("players")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!player) throw new Error("Player not found");

    const race = await ctx.db.get(args.raceId);
    if (!race) throw new Error("Race not found");

    const updatedPlayers = race.players.map(p => {
      if (p.playerId === player._id && !p.isAI) {
        return {
          ...p,
          position: args.position,
          lap: args.lap,
          finished: args.lap >= 3, // 3 laps to finish
        };
      }
      return p;
    });

    await ctx.db.patch(args.raceId, { players: updatedPlayers });

    // Check if race is finished
    const finishedPlayers = updatedPlayers.filter(p => p.finished);
    if (finishedPlayers.length === updatedPlayers.length) {
      await ctx.db.patch(args.raceId, {
        status: "finished",
        endTime: Date.now(),
      });

      // Award points based on ranking
      const rankedPlayers = [...updatedPlayers].sort((a, b) => {
        if (a.finished && !b.finished) return -1;
        if (!a.finished && b.finished) return 1;
        return b.lap - a.lap;
      });

      for (let i = 0; i < rankedPlayers.length; i++) {
        const racePlayer = rankedPlayers[i];
        if (!racePlayer.isAI) {
          const points = Math.max(100 - i * 10, 10);
          const playerDoc = await ctx.db.get(racePlayer.playerId);
          if (playerDoc) {
            await ctx.db.patch(racePlayer.playerId, {
              points: playerDoc.points + points,
            });
          }
        }
      }
    }
  },
});

export const getRace = query({
  args: { raceId: v.id("races") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.raceId);
  },
});

export const getAvailableRaces = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("races")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();
  },
});
