import { router, publicProcedure } from "./trpc";

export const systemRouter = router({
  health: publicProcedure.query(() => ({
    ok: true,
    timestamp: Date.now(),
    version: process.env.npm_package_version ?? "1.0.0",
  })),
});
