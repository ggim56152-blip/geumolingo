import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllLevels,
  getLessonsByLevel,
  getQuizzesByLesson,
  getQuizWithOptions,
  getUserProfile,
  getOrCreateUserProfile,
  updateUserProfile,
  recordQuizCompletion,
  markLessonComplete,
  getAllStocks,
  getUserPortfolioItems,
  getPortfolioItem,
  addOrUpdatePortfolioItem,
  recordTransaction,
  getPortfolioTransactions,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================
  // Learning Routes
  // ============================================

  learning: router({
    // Get all levels
    getLevels: publicProcedure.query(async () => {
      const levels = await getAllLevels();
      return levels;
    }),

    // Get lessons for a specific level
    getLessons: publicProcedure
      .input(z.object({ levelId: z.number() }))
      .query(async ({ input }) => {
        const lessons = await getLessonsByLevel(input.levelId);
        return lessons;
      }),

    // Get quizzes for a specific lesson
    getQuizzes: publicProcedure
      .input(z.object({ lessonId: z.number() }))
      .query(async ({ input }) => {
        const quizzes = await getQuizzesByLesson(input.lessonId);
        return quizzes;
      }),

    // Get quiz with options
    getQuizDetail: publicProcedure
      .input(z.object({ quizId: z.number() }))
      .query(async ({ input }) => {
        const quiz = await getQuizWithOptions(input.quizId);
        return quiz;
      }),

    // Submit quiz answer
    submitQuiz: protectedProcedure
      .input(
        z.object({
          quizId: z.number(),
          selectedOptionId: z.number().optional(),
          selectedAnswer: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const quiz = await getQuizWithOptions(input.quizId);
        if (!quiz) {
          throw new Error("Quiz not found");
        }

        let isCorrect = false;

        if (quiz.type === "multiple_choice" && input.selectedOptionId) {
          const correctOption = quiz.options.find(opt => opt.isCorrect === 1);
          isCorrect = correctOption?.id === input.selectedOptionId;
        } else if (quiz.type === "true_false" && input.selectedAnswer !== undefined) {
          // For true/false, we need to check against the correct option
          const correctOption = quiz.options.find(opt => opt.isCorrect === 1);
          isCorrect = (correctOption?.text === "True") === input.selectedAnswer;
        }

        // Record quiz completion
        await recordQuizCompletion(ctx.user.id, input.quizId, isCorrect);

        // Update user profile with XP if correct
        if (isCorrect) {
          const profile = await getOrCreateUserProfile(ctx.user.id);
          if (profile) {
            const newXP = profile.currentXP + quiz.xpReward;
            const xpPerLevel = 100;
            const newLevel = Math.floor(newXP / xpPerLevel) + 1;

            await updateUserProfile(ctx.user.id, {
              currentXP: newXP,
              totalXP: profile.totalXP + quiz.xpReward,
              currentLevel: newLevel,
              totalQuizzesCompleted: profile.totalQuizzesCompleted + 1,
            });
          }
        }

        return {
          isCorrect,
          explanation: quiz.explanation,
          xpReward: isCorrect ? quiz.xpReward : 0,
        };
      }),

    // Mark lesson as complete
    completeLesson: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await markLessonComplete(ctx.user.id, input.lessonId);

        const profile = await getOrCreateUserProfile(ctx.user.id);
        if (profile) {
          await updateUserProfile(ctx.user.id, {
            totalLessonsCompleted: profile.totalLessonsCompleted + 1,
          });
        }

        return { success: true };
      }),

    // Get user learning profile
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getOrCreateUserProfile(ctx.user.id);
      return profile;
    }),

    // Update notification settings
    updateNotificationSettings: protectedProcedure
      .input(
        z.object({
          notificationTime: z.string().optional(),
          notificationEnabled: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const updates: Record<string, any> = {};
        if (input.notificationTime) {
          updates.notificationTime = input.notificationTime;
        }
        if (input.notificationEnabled !== undefined) {
          updates.notificationEnabled = input.notificationEnabled ? 1 : 0;
        }

        await updateUserProfile(ctx.user.id, updates);
        return { success: true };
      }),

    // Update streak (called daily)
    updateStreak: protectedProcedure.mutation(async ({ ctx }) => {
      const profile = await getOrCreateUserProfile(ctx.user.id);
      if (!profile) return { success: false };

      const now = new Date();
      const lastLearningDate = profile.lastLearningDate
        ? new Date(profile.lastLearningDate)
        : null;

      let newStreak = profile.streak;

      if (lastLearningDate) {
        const daysDiff = Math.floor(
          (now.getTime() - lastLearningDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff === 1) {
          // Consecutive day
          newStreak = profile.streak + 1;
        } else if (daysDiff > 1) {
          // Streak broken
          newStreak = 1;
        }
        // If daysDiff === 0, same day, don't change streak
      } else {
        // First time learning
        newStreak = 1;
      }

      await updateUserProfile(ctx.user.id, {
        streak: newStreak,
        lastLearningDate: now,
      });

      return { streak: newStreak };
    }),
  }),

  // ============================================
  // Portfolio Routes
  // ============================================

  portfolio: router({
    // Get all available stocks
    getStocks: publicProcedure.query(async () => {
      const stocks = await getAllStocks();
      return stocks;
    }),

    // Get user's portfolio
    getPortfolio: protectedProcedure.query(async ({ ctx }) => {
      const items = await getUserPortfolioItems(ctx.user.id);
      const profile = await getOrCreateUserProfile(ctx.user.id);

      return {
        items,
        totalValue: profile?.portfolioValue || 1000000,
        totalCash: profile?.portfolioValue || 1000000,
      };
    }),

    // Buy stock
    buyStock: protectedProcedure
      .input(
        z.object({
          stockId: z.number(),
          quantity: z.number().positive(),
          price: z.number().positive(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const profile = await getOrCreateUserProfile(ctx.user.id);
        if (!profile) return { success: false, error: "Profile not found" };

        const totalCost = input.quantity * input.price;
        if (profile.portfolioValue < totalCost) {
          return { success: false, error: "Insufficient funds" };
        }

        // Record transaction
        await recordTransaction(ctx.user.id, input.stockId, "buy", input.quantity, input.price);

        // Update portfolio item
        const currentValue = input.quantity * input.price;
        await addOrUpdatePortfolioItem(
          ctx.user.id,
          input.stockId,
          input.quantity,
          input.price,
          currentValue
        );

        // Update portfolio value
        await updateUserProfile(ctx.user.id, {
          portfolioValue: profile.portfolioValue - totalCost,
        });

        return { success: true };
      }),

    // Sell stock
    sellStock: protectedProcedure
      .input(
        z.object({
          stockId: z.number(),
          quantity: z.number().positive(),
          price: z.number().positive(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const item = await getPortfolioItem(ctx.user.id, input.stockId);
        if (!item || item.quantity < input.quantity) {
          return { success: false, error: "Insufficient holdings" };
        }

        const profile = await getOrCreateUserProfile(ctx.user.id);
        if (!profile) return { success: false, error: "Profile not found" };

        const totalProceeds = input.quantity * input.price;

        // Record transaction
        await recordTransaction(ctx.user.id, input.stockId, "sell", input.quantity, input.price);

        // Update portfolio item
        const newQuantity = item.quantity - input.quantity;
        if (newQuantity > 0) {
          await addOrUpdatePortfolioItem(
            ctx.user.id,
            input.stockId,
            newQuantity,
            item.purchasePrice,
            newQuantity * input.price
          );
        }

        // Update portfolio value
        await updateUserProfile(ctx.user.id, {
          portfolioValue: profile.portfolioValue + totalProceeds,
        });

        return { success: true };
      }),

    // Get transaction history
    getTransactions: protectedProcedure.query(async ({ ctx }) => {
      const transactions = await getPortfolioTransactions(ctx.user.id);
      return transactions;
    }),
  }),
});

export type AppRouter = typeof appRouter;
