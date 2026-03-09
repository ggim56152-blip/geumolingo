import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Zap, TrendingUp, BookOpen, ArrowRight, User } from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function LearningDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: levels, isLoading: levelsLoading } = trpc.learning.getLevels.useQuery();
  const { data: profile, isLoading: profileLoading } = trpc.learning.getProfile.useQuery();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>로그인 필요</CardTitle>
            <CardDescription>학습을 시작하려면 로그인해주세요.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const xpPerLevel = 100;
  const currentLevelXP = profile?.currentXP || 0;
  const nextLevelXP = xpPerLevel;
  const xpProgress = (currentLevelXP / nextLevelXP) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-12 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              투자 학습을 시작하세요
            </h1>
            <p className="text-lg text-muted-foreground">
              매일 5~10분씩 투자 개념을 배우고 경험치를 획득하세요.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/profile")}
              variant="outline"
              className="border-accent/30 text-accent hover:bg-accent/10"
            >
              <User className="w-4 h-4 mr-2" />
              프로필
            </Button>
            <Button
              onClick={() => navigate("/portfolio")}
              variant="outline"
              className="border-accent/30 text-accent hover:bg-accent/10"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              포트폴리오
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* Level Card */}
          <Card className="border-accent/20 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                현재 레벨
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-3xl font-bold text-accent">
                  {profile?.currentLevel || 1}
                </div>
              )}
            </CardContent>
          </Card>

          {/* XP Card */}
          <Card className="border-accent/20 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                경험치
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold text-foreground">
                  {profile?.totalXP || 0}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="border-accent/20 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                연속 학습
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-3xl font-bold text-orange-500">
                  {profile?.streak || 0}일
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lessons Card */}
          <Card className="border-accent/20 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                완료한 레슨
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-3xl font-bold text-blue-500">
                  {profile?.totalLessonsCompleted || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* XP Progress */}
        {!profileLoading && (
          <Card className="mb-12 border-accent/20 bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">다음 레벨까지의 진행도</CardTitle>
              <CardDescription>
                {nextLevelXP - currentLevelXP} XP 더 필요합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={xpProgress} className="h-3" />
              <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                <span>{currentLevelXP} XP</span>
                <span>{nextLevelXP} XP</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Levels Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">학습 경로</h2>
          {levelsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {levels?.map((level, index) => {
                const isUnlocked = (profile?.currentLevel || 1) >= level.levelNumber;
                const isCurrentLevel = profile?.currentLevel === level.levelNumber;

                return (
                  <Card
                    key={level.id}
                    className={`border-2 transition-all hover:shadow-lg cursor-pointer ${
                      isCurrentLevel
                        ? "border-accent bg-accent/5"
                        : isUnlocked
                          ? "border-accent/30 bg-white/50 backdrop-blur-sm"
                          : "border-muted/30 bg-muted/10 opacity-60"
                    }`}
                    onClick={() => {
                      if (isUnlocked) {
                        navigate(`/learning/${level.id}`);
                      }
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            Level {level.levelNumber}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {level.title}
                          </CardDescription>
                        </div>
                        {isCurrentLevel && (
                          <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-semibold">
                            진행 중
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {level.description}
                      </p>
                      {isUnlocked ? (
                        <Button
                          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/learning/${level.id}`);
                          }}
                        >
                          {isCurrentLevel ? "계속 학습" : "시작하기"}
                        </Button>
                      ) : (
                        <Button disabled className="w-full" variant="outline">
                          {level.requiredXP} XP 필요
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
