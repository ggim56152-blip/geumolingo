import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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

/**
 * User Profiles - Extended user information for learning platform
 */
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  currentLevel: int("currentLevel").default(1).notNull(),
  totalXP: int("totalXP").default(0).notNull(),
  currentXP: int("currentXP").default(0).notNull(),
  streak: int("streak").default(0).notNull(),
  lastLearningDate: timestamp("lastLearningDate"),
  notificationTime: varchar("notificationTime", { length: 5 }).default("08:00"),
  notificationEnabled: int("notificationEnabled").default(1).notNull(),
  totalLessonsCompleted: int("totalLessonsCompleted").default(0).notNull(),
  totalQuizzesCompleted: int("totalQuizzesCompleted").default(0).notNull(),
  portfolioValue: int("portfolioValue").default(1000000).notNull(),
  badges: text("badges"), // JSON array as string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Levels - Learning levels (1-4)
 */
export const levels = mysqlTable("levels", {
  id: int("id").autoincrement().primaryKey(),
  levelNumber: int("levelNumber").notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  requiredXP: int("requiredXP").notNull(),
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Level = typeof levels.$inferSelect;
export type InsertLevel = typeof levels.$inferInsert;

/**
 * Lessons - Learning lessons within levels
 */
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  levelId: int("levelId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content"),
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

/**
 * Quizzes - Quiz questions
 */
export const quizzes = mysqlTable("quizzes", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull(),
  type: mysqlEnum("type", ["multiple_choice", "true_false"]).notNull(),
  question: text("question").notNull(),
  explanation: text("explanation"),
  order: int("order").notNull(),
  xpReward: int("xpReward").default(10).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = typeof quizzes.$inferInsert;

/**
 * Quiz Options - Multiple choice options for quizzes
 */
export const quizOptions = mysqlTable("quizOptions", {
  id: int("id").autoincrement().primaryKey(),
  quizId: int("quizId").notNull(),
  text: text("text").notNull(),
  isCorrect: int("isCorrect").default(0).notNull(),
  order: int("order").notNull(),
});

export type QuizOption = typeof quizOptions.$inferSelect;
export type InsertQuizOption = typeof quizOptions.$inferInsert;

/**
 * User Quiz Progress - Track user's quiz completion
 */
export const userQuizProgress = mysqlTable("userQuizProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  quizId: int("quizId").notNull(),
  isCompleted: int("isCompleted").default(0).notNull(),
  isCorrect: int("isCorrect").default(0).notNull(),
  attemptCount: int("attemptCount").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserQuizProgress = typeof userQuizProgress.$inferSelect;
export type InsertUserQuizProgress = typeof userQuizProgress.$inferInsert;

/**
 * User Lesson Progress - Track user's lesson completion
 */
export const userLessonProgress = mysqlTable("userLessonProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: int("lessonId").notNull(),
  isCompleted: int("isCompleted").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserLessonProgress = typeof userLessonProgress.$inferSelect;
export type InsertUserLessonProgress = typeof userLessonProgress.$inferInsert;

/**
 * Stocks - Stock/ETF data for portfolio simulation
 */
export const stocks = mysqlTable("stocks", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  currentPrice: int("currentPrice").notNull(), // Store as cents to avoid float precision issues
  priceUpdatedAt: timestamp("priceUpdatedAt").defaultNow().notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Stock = typeof stocks.$inferSelect;
export type InsertStock = typeof stocks.$inferInsert;

/**
 * Portfolio Items - User's holdings
 */
export const portfolioItems = mysqlTable("portfolioItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stockId: int("stockId").notNull(),
  quantity: int("quantity").notNull(),
  purchasePrice: int("purchasePrice").notNull(), // Store as cents
  purchaseDate: timestamp("purchaseDate").notNull(),
  currentValue: int("currentValue").notNull(), // Store as cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = typeof portfolioItems.$inferInsert;

/**
 * Portfolio Transactions - Trading history
 */
export const portfolioTransactions = mysqlTable("portfolioTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stockId: int("stockId").notNull(),
  type: mysqlEnum("type", ["buy", "sell"]).notNull(),
  quantity: int("quantity").notNull(),
  price: int("price").notNull(), // Store as cents
  totalAmount: int("totalAmount").notNull(), // Store as cents
  transactionDate: timestamp("transactionDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PortfolioTransaction = typeof portfolioTransactions.$inferSelect;
export type InsertPortfolioTransaction = typeof portfolioTransactions.$inferInsert;