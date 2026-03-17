import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id:            uuid("id").defaultRandom().primaryKey(),
  firstName:     varchar("first_name",  { length: 100 }).notNull(),
  lastName:      varchar("last_name",   { length: 100 }).notNull(),
  email:         varchar("email",       { length: 255 }).notNull().unique(),
  phone:         varchar("phone",       { length: 20  }).notNull(),
  password:      varchar("password",    { length: 255 }).notNull(), // bcrypt hash
  emailVerified: boolean("email_verified").default(false).notNull(),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
  updatedAt:     timestamp("updated_at").defaultNow().notNull(),
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id:        uuid("id").defaultRandom().primaryKey(),
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token:     varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User                     = typeof users.$inferSelect;
export type NewUser                  = typeof users.$inferInsert;
export type EmailVerificationToken   = typeof emailVerificationTokens.$inferSelect;
