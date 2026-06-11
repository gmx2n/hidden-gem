import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { GeospatialIndex } from "@convex-dev/geospatial";
import { components } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const geoIndex = new GeospatialIndex(components.geospatial);

export const listAllPlaces = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("places").collect();
    },
});

export const searchNearby = query({
    args: {
        latitude: v.number(),
        longitude: v.number(),
    },
    handler: async (ctx, args) => {
    const results = await geoIndex.nearest(ctx, {
        point: { latitude: args.latitude, longitude: args.longitude },
        limit: 10,
    });

    const places = await Promise.all(
        results.map(({ key }) => ctx.db.get(key as Id<"places">)),
    );

    return places.filter((v) => !!v);
},
});

export const addPlace = mutation({
    args: {
        name: v.string(),
        latitude: v.float64(),
        longitude: v.float64(),
    },
    handler: async (ctx, args) => {
        const placeId = await ctx.db.insert("places", {
            name: args.name,
            latitude: args.latitude,
            longitude: args.longitude,
        });

        await geoIndex.insert(
            ctx,
            placeId,
            {
                latitude: args.latitude,
                longitude: args.longitude,
            },
            {},
        );

        

        return placeId;
    },
});

export const generateFakePlaces = mutation({
    args: {
        count: v.number(),
        radius: v.number(),
        latitude: v.number(),
        longitude: v.number(),
    },
    handler: async (ctx, args) => {
        const places = [];
        for (let i = 0; i < args.count; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * args.radius;
            const lat = args.latitude + distance * Math.sin(angle);
            const lon = args.longitude + distance * Math.cos(angle);
            places.push({
                name: `Fake Place ${i}`,
                latitude: lat,
                longitude: lon,
            });
        }
        for (let p of places) {
            let placeId = await ctx.db.insert("places", p);
            await geoIndex.insert(
                ctx,
                placeId,
                {
                    latitude: p.latitude,
                    longitude: p.longitude,
                },
                {},
            );
        }
    },
});

