import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, Plus, Minus, DollarSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortfolioPage() {
  const { user } = useAuth();
  const { data: portfolio, isLoading: portfolioLoading, refetch: refetchPortfolio } = trpc.portfolio.getPortfolio.useQuery();
  const { data: stocks, isLoading: stocksLoading } = trpc.portfolio.getStocks.useQuery();
  const { data: transactions, isLoading: transactionsLoading } = trpc.portfolio.getTransactions.useQuery();

  const buyStockMutation = trpc.portfolio.buyStock.useMutation();
  const sellStockMutation = trpc.portfolio.sellStock.useMutation();

  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const handleBuy = async () => {
    if (!selectedStock || !quantity || !price) {
      toast.error("모든 필드를 입력해주세요");
      return;
    }

    try {
      await buyStockMutation.mutateAsync({
        stockId: selectedStock.id,
        quantity: parseInt(quantity),
        price: parseInt(price),
      });
      toast.success("주식을 매수했습니다!");
      setBuyDialogOpen(false);
      setQuantity("");
      setPrice("");
      setSelectedStock(null);
      refetchPortfolio();
    } catch (error) {
      toast.error("매수에 실패했습니다");
    }
  };

  const handleSell = async () => {
    if (!selectedStock || !quantity || !price) {
      toast.error("모든 필드를 입력해주세요");
      return;
    }

    try {
      await sellStockMutation.mutateAsync({
        stockId: selectedStock.id,
        quantity: parseInt(quantity),
        price: parseInt(price),
      });
      toast.success("주식을 매도했습니다!");
      setSellDialogOpen(false);
      setQuantity("");
      setPrice("");
      setSelectedStock(null);
      refetchPortfolio();
    } catch (error) {
      toast.error("매도에 실패했습니다");
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-accent" />
            모의 투자 포트폴리오
          </h1>
          <p className="text-muted-foreground">
            배운 투자 개념을 실제로 연습하세요
          </p>
        </div>

        {/* Portfolio Summary */}
        {portfolioLoading ? (
          <Skeleton className="h-32 mb-8" />
        ) : (
          <Card className="border-accent/20 bg-white/50 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">포트폴리오 자산</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">총 자산</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${(portfolio?.totalValue || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">보유 현금</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${(portfolio?.totalCash || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">보유 주식</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {portfolio?.items?.length || 0}개
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Holdings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-foreground mb-4">보유 주식</h2>
            {portfolioLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : portfolio?.items && portfolio.items.length > 0 ? (
              <div className="space-y-4">
                {portfolio.items.map(item => (
                  <Card key={item.id} className="border-accent/20 bg-white/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">
                            Stock #{item.stockId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}주 @ ${item.purchasePrice.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            ${item.currentValue.toLocaleString()}
                          </p>
                          <p className="text-sm text-green-600">
                            +${(item.currentValue - item.quantity * item.purchasePrice).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-muted/30 bg-muted/10">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">
                    아직 보유한 주식이 없습니다. 아래에서 주식을 매수해보세요.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">거래</h2>
            <div className="space-y-3">
              <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    주식 매수
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>주식 매수</DialogTitle>
                    <DialogDescription>
                      매수할 주식을 선택하고 수량과 가격을 입력하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>주식 선택</Label>
                      <select
                        className="w-full mt-2 p-2 border border-border rounded-md bg-background"
                        onChange={e => {
                          const stock = stocks?.find(s => s.id === parseInt(e.target.value));
                          setSelectedStock(stock);
                        }}
                      >
                        <option value="">선택하세요</option>
                        {stocks?.map(stock => (
                          <option key={stock.id} value={stock.id}>
                            {stock.name} ({stock.symbol})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>수량</Label>
                      <Input
                        type="number"
                        placeholder="수량"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>가격</Label>
                      <Input
                        type="number"
                        placeholder="가격"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <Button
                      onClick={handleBuy}
                      disabled={buyStockMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {buyStockMutation.isPending ? "처리 중..." : "매수"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    <Minus className="w-4 h-4 mr-2" />
                    주식 매도
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>주식 매도</DialogTitle>
                    <DialogDescription>
                      매도할 주식을 선택하고 수량과 가격을 입력하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>주식 선택</Label>
                      <select
                        className="w-full mt-2 p-2 border border-border rounded-md bg-background"
                        onChange={e => {
                          const stock = portfolio?.items?.find(
                            item => item.stockId === parseInt(e.target.value)
                          );
                          setSelectedStock(stock);
                        }}
                      >
                        <option value="">선택하세요</option>
                        {portfolio?.items?.map(item => (
                          <option key={item.id} value={item.stockId}>
                            Stock #{item.stockId} ({item.quantity}주)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>수량</Label>
                      <Input
                        type="number"
                        placeholder="수량"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>가격</Label>
                      <Input
                        type="number"
                        placeholder="가격"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <Button
                      onClick={handleSell}
                      disabled={sellStockMutation.isPending}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      {sellStockMutation.isPending ? "처리 중..." : "매도"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">거래 이력</h2>
          {transactionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map(tx => (
                <Card key={tx.id} className="border-accent/20 bg-white/50 backdrop-blur-sm">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {tx.type === "buy" ? (
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Plus className="w-5 h-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Minus className="w-5 h-5 text-red-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-foreground">
                            {tx.type === "buy" ? "매수" : "매도"} - Stock #{tx.stockId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tx.quantity}주 @ ${tx.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${tx.type === "buy" ? "text-red-600" : "text-green-600"}`}>
                          {tx.type === "buy" ? "-" : "+"}${tx.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.transactionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-muted/30 bg-muted/10">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  거래 이력이 없습니다.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
