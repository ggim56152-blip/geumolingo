import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { CheckCircle2, XCircle, ArrowLeft, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function QuizPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/learning/:levelId/quiz/:quizId");

  const quizId = params?.quizId ? parseInt(params.quizId) : null;

  const { data: quiz, isLoading } = trpc.learning.getQuizDetail.useQuery(
    { quizId: quizId! },
    { enabled: !!quizId }
  );

  const submitQuizMutation = trpc.learning.submitQuiz.useMutation();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    explanation: string | null;
    xpReward: number;
  } | null>(null);

  const handleSubmit = async () => {
    if (!quizId) return;

    if (quiz?.type === "multiple_choice" && selectedOption === null) {
      toast.error("선택지를 선택해주세요");
      return;
    }

    if (quiz?.type === "true_false" && selectedAnswer === null) {
      toast.error("정답을 선택해주세요");
      return;
    }

    try {
      const response = await submitQuizMutation.mutateAsync({
        quizId,
        selectedOptionId: quiz?.type === "multiple_choice" ? selectedOption! : undefined,
        selectedAnswer: quiz?.type === "true_false" ? selectedAnswer! : undefined,
      });

      setResult(response);
      setSubmitted(true);
    } catch (error) {
      toast.error("퀴즈 제출에 실패했습니다");
    }
  };

  const handleNext = () => {
    navigate("/learning");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>로그인 필요</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>퀴즈를 찾을 수 없습니다</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/learning")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </div>

        {/* Quiz Card */}
        <Card className="border-accent/20 bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">{quiz.question}</CardTitle>
            <CardDescription>
              {quiz.type === "multiple_choice" ? "객관식 문제" : "참/거짓 문제"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!submitted ? (
              <>
                {/* Multiple Choice */}
                {quiz.type === "multiple_choice" && (
                  <RadioGroup value={selectedOption?.toString() || ""}>
                    <div className="space-y-3">
                      {quiz.options?.map((option, index) => (
                        <div
                          key={option.id}
                          className="flex items-center space-x-3 p-4 rounded-lg border-2 border-muted/30 hover:border-accent/50 hover:bg-accent/5 cursor-pointer transition-all"
                          onClick={() => setSelectedOption(option.id)}
                        >
                          <RadioGroupItem
                            value={option.id.toString()}
                            id={`option-${option.id}`}
                            onClick={() => setSelectedOption(option.id)}
                          />
                          <Label
                            htmlFor={`option-${option.id}`}
                            className="flex-1 cursor-pointer text-base"
                          >
                            {String.fromCharCode(65 + index)}. {option.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {/* True/False */}
                {quiz.type === "true_false" && (
                  <RadioGroup value={selectedAnswer === null ? "" : selectedAnswer.toString()}>
                    <div className="space-y-3">
                      {[true, false].map((answer, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-4 rounded-lg border-2 border-muted/30 hover:border-accent/50 hover:bg-accent/5 cursor-pointer transition-all"
                          onClick={() => setSelectedAnswer(answer)}
                        >
                          <RadioGroupItem
                            value={answer.toString()}
                            id={`answer-${answer}`}
                            onClick={() => setSelectedAnswer(answer)}
                          />
                          <Label
                            htmlFor={`answer-${answer}`}
                            className="flex-1 cursor-pointer text-base"
                          >
                            {answer ? "참 (True)" : "거짓 (False)"}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={
                    submitQuizMutation.isPending ||
                    (quiz.type === "multiple_choice" && selectedOption === null) ||
                    (quiz.type === "true_false" && selectedAnswer === null)
                  }
                  className="w-full mt-8 bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="lg"
                >
                  {submitQuizMutation.isPending ? "제출 중..." : "제출"}
                </Button>
              </>
            ) : result ? (
              <>
                {/* Result */}
                <div className="space-y-6">
                  {/* Result Icon */}
                  <div className="flex justify-center">
                    {result.isCorrect ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
                        <p className="text-xl font-bold text-green-600">정답입니다!</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-2" />
                        <p className="text-xl font-bold text-red-600">틀렸습니다</p>
                      </div>
                    )}
                  </div>

                  {/* XP Reward */}
                  {result.xpReward > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-900">
                        +{result.xpReward} XP 획득!
                      </span>
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">해설</p>
                    <p className="text-blue-800">{result.explanation}</p>
                  </div>

                  {/* Next Button */}
                  <Button
                    onClick={handleNext}
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    size="lg"
                  >
                    계속하기
                  </Button>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
