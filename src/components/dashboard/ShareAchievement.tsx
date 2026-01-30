import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Trophy, Download, Flame, Clock } from "lucide-react";
import { useSessionHistory } from "@/hooks/useSessionHistory";
import { useStreak } from "@/hooks/useStreak";
import { useAuth } from "@/contexts/AuthContext";
import { useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ShareAchievement = () => {
  const { getTotalStats } = useSessionHistory();
  const { streak } = useStreak();
  const { profile, hasProAccess } = useAuth();
  const stats = getTotalStats();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shareMode, setShareMode] = useState<"stats" | "streak">("stats");

  const generateImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Draw Background (Modern Dark Gradient)
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "#09090b"); // zinc-950
    gradient.addColorStop(1, "#1c1917"); // zinc-900 warm
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);

    // Draw Silhouette Watermark (FOCUU)
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.font = "bold 180px Inter, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.translate(300, 250);
    ctx.rotate(-0.05);
    ctx.fillText("FOCUU", 0, 0);
    ctx.restore();

    // -- Top Pill Label --
    const pillText =
      shareMode === "streak" ? "STREAK MASTER" : "FOCUS ACHIEVEMENT";
    ctx.font = "bold 14px Inter, sans-serif";
    const textWidth = ctx.measureText(pillText).width;
    const pillPadding = 24;
    const pillWidth = textWidth + pillPadding * 2;
    const pillHeight = 32;
    const pillX = 300 - pillWidth / 2;
    const pillY = 40;

    // Draw Pill Shape
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 100); // Full rounding
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)"; // Glass effect
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw Pill Text
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pillText, 300, pillY + pillHeight / 2);

    // -- Main Stats --
    ctx.textBaseline = "alphabetic"; // Reset

    if (shareMode === "stats") {
      // Draw Focus Time
      ctx.shadowColor = "rgba(34, 197, 94, 0.5)"; // Green glow
      ctx.shadowBlur = 20;
      ctx.font = "bold 90px Inter, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${stats.totalMinutes}m`, 300, 210);
      ctx.shadowBlur = 0; // Reset

      ctx.font = "24px Inter, sans-serif";
      ctx.fillStyle = "#a1a1aa"; // zinc-400
      ctx.fillText("Deep Work Time", 300, 255);

      // Sessions (Small sub-stat)
      ctx.font = "18px Inter, sans-serif";
      ctx.fillStyle = "#52525b";
      ctx.fillText(`${stats.totalSessions} Sessions Completed`, 300, 320);
    } else {
      // Draw Streak
      ctx.shadowColor = "rgba(249, 115, 22, 0.5)"; // Orange glow
      ctx.shadowBlur = 20;
      ctx.font = "bold 130px Inter, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${streak}`, 300, 220);
      ctx.shadowBlur = 0;

      ctx.font = "30px Inter, sans-serif";
      ctx.fillStyle = "#f97316"; // Orange
      ctx.fillText("Day Streak 🔥", 300, 270);
    }

    // -- Footer Link (focuu.site/app) --
    ctx.font = "14px Inter, sans-serif";
    ctx.fillStyle = "#52525b"; // zinc-600
    ctx.fillText("focuu.site/app", 300, 365);

    return canvas.toDataURL("image/png");
  };

  const handleDownload = () => {
    if (!hasProAccess) return;
    const dataUrl = generateImage();
    if (dataUrl) {
      const link = document.createElement("a");
      link.download = `focuu-${shareMode}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleShare = async () => {
    if (!hasProAccess) return;
    const dataUrl = generateImage();
    if (!dataUrl) return;

    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `focuu-${shareMode}.png`, {
        type: "image/png",
      });

      if (navigator.share) {
        await navigator.share({
          title: "My Focuu Stats",
          text:
            shareMode === "stats"
              ? `I've focused for ${stats.totalMinutes} minutes on Focuu! 🚀`
              : `I'm on a ${streak} day streak on Focuu! 🔥`,
          files: [file],
        });
      } else {
        handleDownload();
      }
    } catch (err) {
      console.error("Share failed", err);
      handleDownload();
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Your Achievement
          </div>
          {!hasProAccess && (
            <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
              Pro Feature
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-6">
          <Tabs
            value={shareMode}
            onValueChange={(v) => setShareMode(v as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="streak">Streak</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Hidden Canvas - Must redraw when mode changes */}
        <canvas ref={canvasRef} width={600} height={400} className="hidden" />

        <div className="text-center py-6 border-2 border-border/50 border-dashed rounded-lg mb-4 bg-background/50 relative overflow-hidden">
          {!hasProAccess && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center z-10">
              <p className="text-xs font-semibold text-muted-foreground bg-background/80 px-3 py-1 rounded-full border shadow-sm">
                Preview Only
              </p>
            </div>
          )}

          {shareMode === "stats" ? (
            <div className="space-y-2">
              <Clock className="w-8 h-8 mx-auto text-primary" />
              <p className="text-3xl font-bold">{stats.totalMinutes}m</p>
              <p className="text-sm text-muted-foreground">Focus Time</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Flame className="w-8 h-8 mx-auto text-orange-500" />
              <p className="text-3xl font-bold">{streak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleShare}
            disabled={!hasProAccess}
            className="flex-1 gap-2"
            variant="outline"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!hasProAccess}
            variant="ghost"
            size="icon"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareAchievement;
