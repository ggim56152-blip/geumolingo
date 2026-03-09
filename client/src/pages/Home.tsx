import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Zap, Flame, TrendingUp, BookOpen } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">금오링고</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">{user?.name}</span>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/learning")}
                  className="text-foreground hover:bg-accent/10"
                >
                  학습
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/portfolio")}
                  className="text-foreground hover:bg-accent/10"
                >
                  포트폴리오
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/profile")}
                  className="text-foreground hover:bg-accent/10"
                >
                  프로필
                </Button>
                <Button
                  onClick={() => navigate("/learning")}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  시작하기
                </Button>
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                로그인
              </Button>
            )}
          </div>
        </div>
      </nav>

        {/* Hero Section */}
      <section className="container py-20 md:py-32 animate-fade-in">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            투자를 게임처럼 배우세요
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            듀오링고처럼 재미있는 방식으로 투자 개념을 하루 5~10분씩 배우고,
            <br />
            경험치를 모아 레벨업하며, 모의 투자로 실전 경험을 쌓으세요.
          </p>
          {isAuthenticated ? (
            <Button
              onClick={() => navigate("/learning")}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6"
            >
              지금 시작하기
            </Button>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6"
            >
              무료로 시작하기
            </Button>
          )}
        </div>
      </section>

        {/* Features Section */}
      <section className="container py-16 md:py-24 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
          금오링고의 특징
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <Card className="border-accent/20 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-lg">단계별 학습</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Level 1부터 Level 4까지 투자 개념을 체계적으로 배워나갑니다.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="border-accent/20 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-yellow-500" />
              </div>
              <CardTitle className="text-lg">경험치 시스템</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                퀴즈를 풀고 경험치를 모아 레벨을 올려보세요.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="border-accent/20 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <CardTitle className="text-lg">연속 학습 스트릭</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                매일 학습하면 스트릭을 유지하고 추가 보상을 얻으세요.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="border-accent/20 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <CardTitle className="text-lg">모의 투자</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                배운 개념을 실제 시세로 모의 투자하며 연습하세요.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

        {/* How It Works */}
      <section className="container py-16 md:py-24 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
          어떻게 작동하나요?
        </h2>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Step 1 */}
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">레슨 배우기</h3>
              <p className="text-muted-foreground">
                각 레벨의 레슨을 읽고 투자 개념을 이해합니다.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">퀴즈 풀기</h3>
              <p className="text-muted-foreground">
                객관식과 OX 문제로 배운 내용을 확인하고 경험치를 획득합니다.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">레벨업하기</h3>
              <p className="text-muted-foreground">
                경험치를 모아 다음 레벨로 진급하고 더 어려운 개념을 배웁니다.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold">
              4
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">모의 투자하기</h3>
              <p className="text-muted-foreground">
                배운 개념을 실제 시세로 모의 투자하며 실전 경험을 쌓습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

        {/* CTA Section */}
      <section className="container py-16 md:py-24 animate-fade-in">
        <Card className="border-accent/30 bg-gradient-to-r from-accent/10 via-accent/5 to-background">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl text-foreground">
              지금 바로 시작하세요
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              투자를 게임처럼 배우고 경제적 자유를 향해 나아가세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate("/learning")}
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6"
              >
                학습 시작
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => (window.location.href = getLoginUrl())}
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6"
                >
                  무료 가입
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-6"
                >
                  더 알아보기
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16 py-8">
        <div className="container text-center text-muted-foreground text-sm">
          <p>
            © 2026 금오링고. 본 사이트는 교육 목적의 가상 투자 플랫폼입니다.
            <br />
            실제 투자 조언이 아니며, 투자는 신중하게 결정하세요.
          </p>
        </div>
      </footer>
    </div>
  );
}
