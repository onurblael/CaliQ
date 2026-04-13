import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import fs from "fs";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Enable CORS for all routes - reflect the request origin to support credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Serve website static files — tries website/ first, falls back to project root
  app.use(express.static("website"));
  app.use(express.static("."));

  registerOAuthRoutes(app);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  // Waitlist endpoint — saves emails to waitlist.json in project root
  const waitlistFile = path.resolve("waitlist.json");
  app.post("/api/waitlist", (req, res) => {
    const { email } = req.body ?? {};
    if (!email || typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ error: "Invalid email" });
      return;
    }
    try {
      let list: string[] = [];
      if (fs.existsSync(waitlistFile)) {
        list = JSON.parse(fs.readFileSync(waitlistFile, "utf-8"));
      }
      if (!list.includes(email)) {
        list.push(email);
        fs.writeFileSync(waitlistFile, JSON.stringify(list, null, 2));
        console.log(`[waitlist] New signup: ${email} (total: ${list.length})`);
      }
      res.json({ ok: true });
    } catch (err) {
      console.error("[waitlist] Error saving email:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/waitlist", (_req, res) => {
    try {
      const list = fs.existsSync(waitlistFile)
        ? JSON.parse(fs.readFileSync(waitlistFile, "utf-8"))
        : [];
      res.json({ count: list.length, emails: list });
    } catch {
      res.json({ count: 0, emails: [] });
    }
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}

startServer().catch(console.error);
