import { drizzle } from "drizzle-orm/mysql2";
import { levels, lessons, quizzes, quizOptions } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const learningContent = [
  {
    level: 1,
    levelTitle: "주식 기초",
    levelDescription: "주식과 주식 시장의 기본 개념을 배웁니다",
    lessons: [
      {
        title: "주식이란?",
        description: "주식의 정의와 기본 개념",
        content: "주식은 회사의 소유권을 나타내는 증권입니다. 주식을 구매하면 그 회사의 부분 소유자가 됩니다.",
        quizzes: [
          {
            type: "multiple_choice",
            question: "주식이란 무엇인가요?",
            explanation: "주식은 회사의 소유권을 나타내는 증권으로, 주식을 구매하면 그 회사의 부분 소유자가 됩니다.",
            options: [
              { text: "회사의 소유권을 나타내는 증권", isCorrect: true },
              { text: "회사에 돈을 빌려주는 것", isCorrect: false },
              { text: "회사의 상품을 구매하는 것", isCorrect: false },
            ],
          },
          {
            type: "true_false",
            question: "주식을 구매하면 그 회사의 부분 소유자가 된다.",
            explanation: "맞습니다. 주식을 구매하면 그 회사의 부분 소유자가 되어 회사의 이익과 손실을 공유합니다.",
            options: [
              { text: "True", isCorrect: true },
              { text: "False", isCorrect: false },
            ],
          },
        ],
      },
      {
        title: "주식 시장",
        description: "주식이 거래되는 시장에 대해 배웁니다",
        content: "주식 시장은 주식이 사고팔리는 장소입니다. 나스닥과 뉴욕증권거래소(NYSE)가 대표적인 미국 주식 시장입니다.",
        quizzes: [
          {
            type: "multiple_choice",
            question: "나스닥은 어떤 시장인가요?",
            explanation: "나스닥은 미국의 주요 주식 시장 중 하나로, 기술 회사들이 많이 상장되어 있습니다.",
            options: [
              { text: "미국의 주요 주식 시장", isCorrect: true },
              { text: "한국의 주식 시장", isCorrect: false },
              { text: "암호화폐 거래소", isCorrect: false },
            ],
          },
        ],
      },
      {
        title: "주가와 수익",
        description: "주가 변동과 투자 수익에 대해 배웁니다",
        content: "주가는 시장의 수요와 공급에 따라 변동합니다. 주가가 올라가면 수익을 얻을 수 있고, 내려가면 손실을 볼 수 있습니다.",
        quizzes: [
          {
            type: "true_false",
            question: "주가는 항상 올라간다.",
            explanation: "거짓입니다. 주가는 시장의 수요와 공급에 따라 변동하며, 올라갈 수도 있고 내려갈 수도 있습니다.",
            options: [
              { text: "True", isCorrect: false },
              { text: "False", isCorrect: true },
            ],
          },
        ],
      },
    ],
  },
  {
    level: 2,
    levelTitle: "ETF와 분산 투자",
    levelDescription: "ETF와 포트폴리오 분산 전략을 배웁니다",
    lessons: [
      {
        title: "ETF란?",
        description: "상장지수펀드(ETF)의 개념",
        content: "ETF는 여러 주식을 한 번에 구매할 수 있는 상품입니다. 한 개의 ETF를 구매하면 여러 회사의 주식을 동시에 소유하게 됩니다.",
        quizzes: [
          {
            type: "multiple_choice",
            question: "ETF는 무엇인가요?",
            explanation: "ETF는 여러 주식을 한 번에 구매할 수 있는 상장지수펀드입니다.",
            options: [
              { text: "여러 주식을 한 번에 구매할 수 있는 상품", isCorrect: true },
              { text: "하나의 회사 주식", isCorrect: false },
              { text: "암호화폐", isCorrect: false },
            ],
          },
        ],
      },
      {
        title: "분산 투자",
        description: "포트폴리오 분산 전략",
        content: "분산 투자는 여러 종목에 투자하여 위험을 줄이는 전략입니다. 한 종목에만 투자하면 위험이 크지만, 여러 종목에 분산하면 위험을 줄일 수 있습니다.",
        quizzes: [
          {
            type: "true_false",
            question: "한 종목에만 투자하는 것이 분산 투자이다.",
            explanation: "거짓입니다. 분산 투자는 여러 종목에 투자하여 위험을 줄이는 전략입니다.",
            options: [
              { text: "True", isCorrect: false },
              { text: "False", isCorrect: true },
            ],
          },
        ],
      },
    ],
  },
  {
    level: 3,
    levelTitle: "기업 분석",
    levelDescription: "재무제표와 기업 분석 방법을 배웁니다",
    lessons: [
      {
        title: "재무제표 읽기",
        description: "손익계산서, 재무상태표, 현금흐름표",
        content: "재무제표는 회사의 재무 상태를 나타내는 문서입니다. 손익계산서는 수익과 비용, 재무상태표는 자산과 부채, 현금흐름표는 현금의 흐름을 보여줍니다.",
        quizzes: [
          {
            type: "multiple_choice",
            question: "손익계산서는 무엇을 보여주나요?",
            explanation: "손익계산서는 회사의 수익과 비용, 그리고 이익을 보여줍니다.",
            options: [
              { text: "수익과 비용, 이익", isCorrect: true },
              { text: "자산과 부채", isCorrect: false },
              { text: "현금의 흐름", isCorrect: false },
            ],
          },
        ],
      },
      {
        title: "기업 가치 평가",
        description: "PER, PBR 등 주요 지표",
        content: "PER(주가수익비율)은 주가를 회사의 수익으로 나눈 값입니다. PER이 낮을수록 저평가된 주식으로 볼 수 있습니다.",
        quizzes: [
          {
            type: "true_false",
            question: "PER이 낮을수록 저평가된 주식이다.",
            explanation: "맞습니다. PER이 낮을수록 주가가 상대적으로 저평가되어 있다고 볼 수 있습니다.",
            options: [
              { text: "True", isCorrect: true },
              { text: "False", isCorrect: false },
            ],
          },
        ],
      },
    ],
  },
  {
    level: 4,
    levelTitle: "거시경제",
    levelDescription: "경제 지표와 시장 트렌드를 배웁니다",
    lessons: [
      {
        title: "경제 지표",
        description: "GDP, 실업률, 인플레이션",
        content: "GDP는 국내총생산으로 한 국가의 경제 규모를 나타냅니다. 실업률은 일자리가 없는 사람의 비율이고, 인플레이션은 물가 상승률입니다.",
        quizzes: [
          {
            type: "multiple_choice",
            question: "GDP는 무엇을 나타내나요?",
            explanation: "GDP는 국내총생산으로 한 국가의 경제 규모를 나타냅니다.",
            options: [
              { text: "한 국가의 경제 규모", isCorrect: true },
              { text: "회사의 이익", isCorrect: false },
              { text: "주가의 변동", isCorrect: false },
            ],
          },
        ],
      },
      {
        title: "금리와 시장",
        description: "중앙은행의 금리 결정과 시장 영향",
        content: "중앙은행이 금리를 올리면 대출이 어려워져 경제가 둔화될 수 있습니다. 금리를 내리면 대출이 쉬워져 경제가 활성화될 수 있습니다.",
        quizzes: [
          {
            type: "true_false",
            question: "금리가 올라가면 주가가 올라간다.",
            explanation: "거짓입니다. 일반적으로 금리가 올라가면 대출이 어려워져 주가가 내려갈 수 있습니다.",
            options: [
              { text: "True", isCorrect: false },
              { text: "False", isCorrect: true },
            ],
          },
        ],
      },
    ],
  },
];

async function seedContent() {
  try {
    console.log("Starting to seed learning content...");

    for (const levelData of learningContent) {
      // Insert level
      const levelResult = await db.insert(levels).values({
        levelNumber: levelData.level,
        title: levelData.levelTitle,
        description: levelData.levelDescription,
        requiredXP: levelData.level * 100,
        order: levelData.level,
      });

      const levelId = levelResult[0].insertId;
      console.log(`✅ Created Level ${levelData.level}: ${levelData.levelTitle}`);

      // Insert lessons
      for (let lessonIndex = 0; lessonIndex < levelData.lessons.length; lessonIndex++) {
        const lessonData = levelData.lessons[lessonIndex];
        const lessonResult = await db.insert(lessons).values({
          levelId,
          title: lessonData.title,
          description: lessonData.description,
          content: lessonData.content,
          order: lessonIndex + 1,
        });

        const lessonId = lessonResult[0].insertId;
        console.log(`  ✅ Created Lesson: ${lessonData.title}`);

        // Insert quizzes
        for (let quizIndex = 0; quizIndex < lessonData.quizzes.length; quizIndex++) {
          const quizData = lessonData.quizzes[quizIndex];
          const quizResult = await db.insert(quizzes).values({
            lessonId,
            type: quizData.type as "multiple_choice" | "true_false",
            question: quizData.question,
            explanation: quizData.explanation,
            xpReward: 10,
            order: quizIndex + 1,
          });

          const quizId = quizResult[0].insertId;

          // Insert quiz options
          for (let optionIndex = 0; optionIndex < quizData.options.length; optionIndex++) {
            const optionData = quizData.options[optionIndex];
            await db.insert(quizOptions).values({
              quizId,
              text: optionData.text,
              isCorrect: optionData.isCorrect ? 1 : 0,
              order: optionIndex + 1,
            });
          }

          console.log(`    ✅ Created Quiz: ${quizData.question}`);
        }
      }
    }

    console.log("\n✅ Successfully seeded all learning content!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding content:", error);
    process.exit(1);
  }
}

seedContent();
