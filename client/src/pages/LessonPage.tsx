import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Play } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function LessonPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/learning/:levelId/lesson/:lessonId");

  const lessonId = params?.lessonId ? parseInt(params.lessonId) : null;
  const levelId = params?.levelId ? parseInt(params.levelId) : null;

  const { data: lesson, isLoading: lessonLoading } = trpc.learning.getLessons.useQuery(
    { levelId: levelId! },
    { enabled: !!levelId }
  );

  const { data: quizzes, isLoading: quizzesLoading } = trpc.learning.getQuizzes.useQuery(
    { lessonId: lessonId! },
    { enabled: !!lessonId }
  );

  const completeLessonMutation = trpc.learning.completeLesson.useMutation();

  const currentLesson = lesson?.find(l => l.id === lessonId);

  const handleStartQuiz = async (quizId: number) => {
    navigate(`/learning/${levelId}/quiz/${quizId}`);
  };

  const handleCompleteLesson = async () => {
    if (!lessonId) return;

    try {
      await completeLessonMutation.mutateAsync({ lessonId });
      toast.success("레슨을 완료했습니다!");
      navigate(`/learning/${levelId}`);
    } catch (error) {
      toast.error("레슨 완료에 실패했습니다");
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/learning/${levelId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </div>

        {/* Lesson Content */}
        {lessonLoading ? (
          <Skeleton className="h-96" />
        ) : currentLesson ? (
          <>
            <Card className="border-accent/20 bg-white/50 backdrop-blur-sm mb-8">
              <CardHeader>
                <CardTitle className="text-3xl">{currentLesson.title}</CardTitle>
                <CardDescription className="text-base mt-2">
                  {currentLesson.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">
                    {currentLesson.content}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quizzes */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">이 레슨의 퀴즈</h2>

              {quizzesLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : quizzes && quizzes.length > 0 ? (
                <div className="space-y-4">
                  {quizzes.map((quiz, index) => (
                    <Card
                      key={quiz.id}
                      className="border-accent/20 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">
                          퀴즈 {index + 1}: {quiz.question.substring(0, 50)}...
                        </CardTitle>
                        <CardDescription>
                          {quiz.type === "multiple_choice" ? "객관식" : "참/거짓"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
                          onClick={() => handleStartQuiz(quiz.id)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          퀴즈 풀기
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-muted/30 bg-muted/10">
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">
                      이 레슨에는 퀴즈가 없습니다.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Complete Button */}
            <Button
              onClick={handleCompleteLesson}
              disabled={completeLessonMutation.isPending}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              {completeLessonMutation.isPending ? "처리 중..." : "레슨 완료"}
            </Button>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>레슨을 찾을 수 없습니다</CardTitle>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
