import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Award, Calendar, Zap, Flame, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: profile, isLoading: profileLoading } = trpc.learning.getProfile.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    logout();
    navigate("/");
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

  const badges = [
    { id: 1, name: "첫 레슨 완료", icon: "🎓", earned: profile?.totalLessonsCompleted || 0 > 0 },
    { id: 2, name: "10일 연속 학습", icon: "🔥", earned: (profile?.streak || 0) >= 10 },
    { id: 3, name: "Level 2 달성", icon: "⭐", earned: (profile?.currentLevel || 1) >= 2 },
    { id: 4, name: "100 XP 획득", icon: "⚡", earned: (profile?.totalXP || 0) >= 100 },
    { id: 5, name: "Level 3 달성", icon: "🌟", earned: (profile?.currentLevel || 1) >= 3 },
    { id: 6, name: "Level 4 달성", icon: "👑", earned: (profile?.currentLevel || 1) >= 4 },
  ];

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
        </div>

        {/* Profile Card */}
        <Card className="border-accent/20 bg-white/50 backdrop-blur-sm mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl">{user?.name}</CardTitle>
                <CardDescription className="mt-2">
                  {user?.email}
                </CardDescription>
              </div>
              <Button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">가입일</p>
                <p className="font-semibold text-foreground">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("ko-KR") : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">마지막 로그인</p>
                <p className="font-semibold text-foreground">
                  {user?.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString("ko-KR") : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">역할</p>
                <p className="font-semibold text-foreground">
                  {user?.role === "admin" ? "관리자" : "사용자"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">로그인 방법</p>
                <p className="font-semibold text-foreground">
                  {user?.loginMethod || "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Learning Stats */}
          <Card className="border-accent/20 bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                학습 통계
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileLoading ? (
                <>
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">현재 레벨</span>
                    <span className="font-semibold text-lg text-accent">
                      {profile?.currentLevel || 1}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">총 경험치</span>
                    <span className="font-semibold text-lg text-yellow-600">
                      {profile?.totalXP || 0} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">완료한 레슨</span>
                    <span className="font-semibold text-lg text-blue-600">
                      {profile?.totalLessonsCompleted || 0}개
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Streak Stats */}
          <Card className="border-accent/20 bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                연속 학습
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileLoading ? (
                <>
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">현재 스트릭</span>
                    <span className="font-semibold text-lg text-orange-500">
                      {profile?.streak || 0}일
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">총 학습 일수</span>
                    <span className="font-semibold text-lg text-orange-600">
                      {profile?.totalLessonsCompleted || 0}일
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-accent" />
            성취 배지
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map(badge => (
              <Card
                key={badge.id}
                className={`border-2 transition-all ${badge.earned ? "animate-pulse-subtle" : ""} ${
                  badge.earned
                    ? "border-accent/30 bg-accent/5"
                    : "border-muted/30 bg-muted/10 opacity-50"
                }`}
              >
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl mb-2 transform hover:scale-110 transition-transform duration-200">{badge.icon}</div>
                  <p className="font-semibold text-foreground text-sm">
                    {badge.name}
                  </p>
                  {!badge.earned && (
                    <p className="text-xs text-muted-foreground mt-2">
                      미달성
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
