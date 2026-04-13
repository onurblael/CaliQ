import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// User preferences table with encrypted sensitive data
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  weightEncrypted: text("weightEncrypted"),
  goalEncrypted: varchar("goalEncrypted", { length: 255 }),
  restrictionsEncrypted: text("restrictionsEncrypted"),
  dislikedIngredientsEncrypted: text("dislikedIngredientsEncrypted"),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;

// Meal history table
export const mealHistory = mysqlTable("mealHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  mealName: varchar("mealName", { length: 255 }).notNull(),
  calories: int("calories").notNull(),
  protein: int("protein"),
  carbs: int("carbs"),
  fat: int("fat"),
  liked: boolean("liked").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MealHistory = typeof mealHistory.$inferSelect;
export type InsertMealHistory = typeof mealHistory.$inferInsert;
