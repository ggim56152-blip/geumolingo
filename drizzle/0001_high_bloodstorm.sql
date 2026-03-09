CREATE TABLE `lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`levelId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` text,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `levels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`levelNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`requiredXP` int NOT NULL,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `levels_id` PRIMARY KEY(`id`),
	CONSTRAINT `levels_levelNumber_unique` UNIQUE(`levelNumber`)
);
--> statement-breakpoint
CREATE TABLE `portfolioItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stockId` int NOT NULL,
	`quantity` int NOT NULL,
	`purchasePrice` int NOT NULL,
	`purchaseDate` timestamp NOT NULL,
	`currentValue` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portfolioItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolioTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stockId` int NOT NULL,
	`type` enum('buy','sell') NOT NULL,
	`quantity` int NOT NULL,
	`price` int NOT NULL,
	`totalAmount` int NOT NULL,
	`transactionDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portfolioTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizOptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quizId` int NOT NULL,
	`text` text NOT NULL,
	`isCorrect` int NOT NULL DEFAULT 0,
	`order` int NOT NULL,
	CONSTRAINT `quizOptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int NOT NULL,
	`type` enum('multiple_choice','true_false') NOT NULL,
	`question` text NOT NULL,
	`explanation` text,
	`order` int NOT NULL,
	`xpReward` int NOT NULL DEFAULT 10,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`currentPrice` int NOT NULL,
	`priceUpdatedAt` timestamp NOT NULL DEFAULT (now()),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stocks_id` PRIMARY KEY(`id`),
	CONSTRAINT `stocks_symbol_unique` UNIQUE(`symbol`)
);
--> statement-breakpoint
CREATE TABLE `userLessonProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lessonId` int NOT NULL,
	`isCompleted` int NOT NULL DEFAULT 0,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userLessonProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentLevel` int NOT NULL DEFAULT 1,
	`totalXP` int NOT NULL DEFAULT 0,
	`currentXP` int NOT NULL DEFAULT 0,
	`streak` int NOT NULL DEFAULT 0,
	`lastLearningDate` timestamp,
	`notificationTime` varchar(5) DEFAULT '08:00',
	`notificationEnabled` int NOT NULL DEFAULT 1,
	`totalLessonsCompleted` int NOT NULL DEFAULT 0,
	`totalQuizzesCompleted` int NOT NULL DEFAULT 0,
	`portfolioValue` int NOT NULL DEFAULT 1000000,
	`badges` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `userQuizProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`quizId` int NOT NULL,
	`isCompleted` int NOT NULL DEFAULT 0,
	`isCorrect` int NOT NULL DEFAULT 0,
	`attemptCount` int NOT NULL DEFAULT 0,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userQuizProgress_id` PRIMARY KEY(`id`)
);
