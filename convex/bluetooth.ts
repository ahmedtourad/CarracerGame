import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendBluetoothInvite = mutation({
  args: { 
    guestName: v.string(),
    raceId: v.id("races"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // In a real app, this would find the guest by Bluetooth discovery
    // For demo purposes, we'll simulate finding a user by name
    const guestUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.guestName))
      .first();

    if (!guestUser) {
      throw new Error("Player not found via Bluetooth");
    }

    return await ctx.db.insert("bluetoothConnections", {
      hostId: userId,
      guestId: guestUser._id,
      status: "pending",
      raceId: args.raceId,
    });
  },
});

export const respondToBluetoothInvite = mutation({
  args: { 
    connectionId: v.id("bluetoothConnections"),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) throw new Error("Connection not found");

    if (connection.guestId !== userId) {
      throw new Error("Not authorized");
    }

    const status = args.accept ? "accepted" : "rejected";
    await ctx.db.patch(args.connectionId, { status });

    if (args.accept && connection.raceId) {
      // Auto-join the race
      const player = await ctx.db
        .query("players")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique();

      if (player) {
        const race = await ctx.db.get(connection.raceId);
        if (race && race.status === "waiting" && race.players.length < race.maxPlayers) {
          const newPlayer = {
            playerId: player._id,
            name: player.name,
            position: { x: 100 + race.players.length * 50, y: 100 },
            lap: 0,
            finished: false,
            isAI: false,
          };

          await ctx.db.patch(connection.raceId, {
            players: [...race.players, newPlayer],
          });
        }
      }
    }
  },
});

export const getBluetoothInvites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const invites = await ctx.db
      .query("bluetoothConnections")
      .withIndex("by_guest", (q) => q.eq("guestId", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const result = [];
    for (const invite of invites) {
      const host = await ctx.db.get(invite.hostId);
      const race = invite.raceId ? await ctx.db.get(invite.raceId) : null;
      result.push({
        ...invite,
        hostName: host?.name || "Unknown",
        raceName: race?.name || "Unknown Race",
      });
    }

    return result;
  },
});
