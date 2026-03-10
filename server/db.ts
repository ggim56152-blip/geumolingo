import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  userProfiles,
  InsertUserProfile,
  levels,
  lessons,
  quizzes,
  quizOptions,
  userQuizProgress,
  userLessonProgress,
  stocks,
  portfolioItems,
  portfolioTransactions,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

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

/**
 * User Management
 */
export async function createUser(email: string, passwordHash: string, name?: string): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values({
    email,
    passwordHash,
    name,
    emailVerified: 0,
    loginMethod: "email",
    role: "user",
  });

  return result[0].insertId;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateLastSignedIn(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function verifyUserEmail(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ emailVerified: 1, verificationToken: null }).where(eq(users.id, userId));
}

/**
 * User Profile Management
 */
export async function getOrCreateUserProfile(userId: number): Promise<any> {
  const db = await getDb();
  if (!db) return undefined;

  const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  await db.insert(userProfiles).values({
    userId,
    currentLevel: 1,
    totalXP: 0,
    currentXP: 0,
    streak: 0,
    totalLessonsCompleted: 0,
    totalQuizzesCompleted: 0,
    portfolioValue: 1000000,
  });

  const newProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return newProfile.length > 0 ? newProfile[0] : undefined;
}

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, updates: Partial<InsertUserProfile>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(userProfiles).set(updates).where(eq(userProfiles.userId, userId));
}

/**
 * Learning Content
 */
export async function getAllLevels() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(levels).orderBy(levels.order);
}

export async function getLessonsByLevel(levelId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(lessons).where(eq(lessons.levelId, levelId)).orderBy(lessons.order);
}

export async function getQuizzesByLesson(lessonId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(quizzes).where(eq(quizzes.lessonId, lessonId)).orderBy(quizzes.order);
}

export async function getQuizWithOptions(quizId: number) {
  const db = await getDb();
  if (!db) return null;

  const quiz = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
  if (!quiz.length) return null;

  const options = await db.select().from(quizOptions).where(eq(quizOptions.quizId, quizId)).orderBy(quizOptions.order);

  return {
    ...quiz[0],
    options,
  };
}

/**
 * Quiz Progress
 */
export async function recordQuizCompletion(userId: number, quizId: number, isCorrect: boolean): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = await db
    .select()
    .from(userQuizProgress)
    .where(and(eq(userQuizProgress.userId, userId), eq(userQuizProgress.quizId, quizId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(userQuizProgress)
      .set({
        isCompleted: 1,
        isCorrect: isCorrect ? 1 : 0,
        attemptCount: existing[0].attemptCount + 1,
        completedAt: new Date(),
      })
      .where(and(eq(userQuizProgress.userId, userId), eq(userQuizProgress.quizId, quizId)));
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

export async function markLessonComplete(userId: number, lessonId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = await db
    .select()
    .from(userLessonProgress)
    .where(and(eq(userLessonProgress.userId, userId), eq(userLessonProgress.lessonId, lessonId)))
    .limit(1);

  if (!existing.length) {
    await db.insert(userLessonProgress).values({
      userId,
      lessonId,
      isCompleted: 1,
      completedAt: new Date(),
    });
  }
}

/**
 * Stock & Portfolio Management
 */
export async function getAllStocks() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(stocks);
}

export async function getUserPortfolioItems(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(portfolioItems).where(eq(portfolioItems.userId, userId));
}

export async function getPortfolioItem(userId: number, stockId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(portfolioItems)
    .where(and(eq(portfolioItems.userId, userId), eq(portfolioItems.stockId, stockId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function addOrUpdatePortfolioItem(
  userId: number,
  stockId: number,
  quantity: number,
  purchasePrice: number,
  currentValue: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = await getPortfolioItem(userId, stockId);

  if (existing) {
    await db
      .update(portfolioItems)
      .set({
        quantity,
        currentValue,
      })
      .where(and(eq(portfolioItems.userId, userId), eq(portfolioItems.stockId, stockId)));
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

export async function recordTransaction(
  userId: number,
  stockId: number,
  type: "buy" | "sell",
  quantity: number,
  price: number
): Promise<void> {
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

export async function getPortfolioTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(portfolioTransactions).where(eq(portfolioTransactions.userId, userId));
}
