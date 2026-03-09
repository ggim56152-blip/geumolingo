import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import {
  InsertUserProfile,
  levels,
  lessons,
  portfolioItems,
  portfolioTransactions,
  quizOptions,
  quizzes,
  stocks,
  userLessonProgress,
  userProfiles,
  userQuizProgress,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// User Profile Queries
// ============================================

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getOrCreateUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  let profile = await getUserProfile(userId);
  if (!profile) {
    await db.insert(userProfiles).values({ userId });
    profile = await getUserProfile(userId);
  }
  return profile;
}

export async function updateUserProfile(
  userId: number,
  updates: Partial<Omit<InsertUserProfile, 'userId'>>
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(userProfiles)
    .set(updates)
    .where(eq(userProfiles.userId, userId));
}

// ============================================
// Level & Lesson Queries
// ============================================

export async function getAllLevels() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(levels).orderBy(levels.order);
}

export async function getLevelById(levelId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(levels)
    .where(eq(levels.id, levelId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getLessonsByLevel(levelId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(lessons)
    .where(eq(lessons.levelId, levelId))
    .orderBy(lessons.order);
}

export async function getLessonById(lessonId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Quiz Queries
// ============================================

export async function getQuizzesByLesson(lessonId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(quizzes)
    .where(eq(quizzes.lessonId, lessonId))
    .orderBy(quizzes.order);
}

export async function getQuizById(quizId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getQuizWithOptions(quizId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const quiz = await getQuizById(quizId);
  if (!quiz) return undefined;

  const options = await db
    .select()
    .from(quizOptions)
    .where(eq(quizOptions.quizId, quizId))
    .orderBy(quizOptions.order);

  return { ...quiz, options };
}

// ============================================
// User Progress Queries
// ============================================

export async function getUserQuizProgress(userId: number, quizId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(userQuizProgress)
    .where(
      and(
        eq(userQuizProgress.userId, userId),
        eq(userQuizProgress.quizId, quizId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function recordQuizCompletion(
  userId: number,
  quizId: number,
  isCorrect: boolean
) {
  const db = await getDb();
  if (!db) return;

  const existing = await getUserQuizProgress(userId, quizId);

  if (existing) {
    await db
      .update(userQuizProgress)
      .set({
        isCompleted: 1,
        isCorrect: isCorrect ? 1 : 0,
        attemptCount: existing.attemptCount + 1,
        completedAt: new Date(),
      })
      .where(
        and(
          eq(userQuizProgress.userId, userId),
          eq(userQuizProgress.quizId, quizId)
        )
      );
  } else {
    await db.insert(userQuizProgress).values({
      userId,
      quizId,
      isCompleted: 1,
      isCorrect: isCorrect ? 1 : 0,
      attemptCount: 1,
      completedAt: new Date(),
    });
  }
}

export async function getUserLessonProgress(userId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(userLessonProgress)
    .where(
      and(
        eq(userLessonProgress.userId, userId),
        eq(userLessonProgress.lessonId, lessonId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function markLessonComplete(userId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return;

  const existing = await getUserLessonProgress(userId, lessonId);

  if (!existing) {
    await db.insert(userLessonProgress).values({
      userId,
      lessonId,
      isCompleted: 1,
      completedAt: new Date(),
    });
  }
}

// ============================================
// Stock & Portfolio Queries
// ============================================

export async function getStockBySymbol(symbol: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(stocks)
    .where(eq(stocks.symbol, symbol))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllStocks() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(stocks);
}

export async function getUserPortfolioItems(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(portfolioItems)
    .where(eq(portfolioItems.userId, userId));
}

export async function getPortfolioItem(userId: number, stockId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(portfolioItems)
    .where(
      and(
        eq(portfolioItems.userId, userId),
        eq(portfolioItems.stockId, stockId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function addOrUpdatePortfolioItem(
  userId: number,
  stockId: number,
  quantity: number,
  purchasePrice: number,
  currentValue: number
) {
  const db = await getDb();
  if (!db) return;

  const existing = await getPortfolioItem(userId, stockId);

  if (existing) {
    await db
      .update(portfolioItems)
      .set({
        quantity,
        purchasePrice,
        currentValue,
      })
      .where(
        and(
          eq(portfolioItems.userId, userId),
          eq(portfolioItems.stockId, stockId)
        )
      );
  } else {
    await db.insert(portfolioItems).values({
      userId,
      stockId,
      quantity,
      purchasePrice,
      purchaseDate: new Date(),
      currentValue,
    });
  }
}

export async function getPortfolioTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(portfolioTransactions)
    .where(eq(portfolioTransactions.userId, userId))
    .orderBy(portfolioTransactions.transactionDate);
}

export async function recordTransaction(
  userId: number,
  stockId: number,
  type: 'buy' | 'sell',
  quantity: number,
  price: number
) {
  const db = await getDb();
  if (!db) return;

  const totalAmount = quantity * price;

  await db.insert(portfolioTransactions).values({
    userId,
    stockId,
    type,
    quantity,
    price,
    totalAmount,
    transactionDate: new Date(),
  });
}
