import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LevelPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/learning/:levelId");

  const levelId = params?.levelId ? parseInt(params.levelId) : null;

  const { data: lessons, isLoading: lessonsLoading } = trpc.learning.getLessons.useQuery(
    { levelId: levelId! },
    { enabled: !!levelId }
  );

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
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Level {levelId}
          </h1>
          <p className="text-muted-foreground mt-2">
            이 레벨의 모든 레슨을 완료하세요
          </p>
        </div>

        {/* Lessons List */}
        {lessonsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {lessons?.map((lesson, index) => (
              <Card
                key={lesson.id}
                className="border-accent/20 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/learning/${levelId}/lesson/${lesson.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-accent" />
                        {lesson.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {lesson.description}
                      </CardDescription>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-muted/30 flex-shrink-0" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/learning/${levelId}/lesson/${lesson.id}`);
                    }}
                  >
                    레슨 시작
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
