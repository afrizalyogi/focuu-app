import { cn } from "@/lib/utils";

interface CustomBackgroundProps {
  imageUrl?: string;
  videoUrl?: string;
  className?: string;
}

const CustomBackground = ({ imageUrl, videoUrl, className }: CustomBackgroundProps) => {
  if (!imageUrl && !videoUrl) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-0 overflow-hidden",
      className
    )}>
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10" />
      
      {videoUrl ? (
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}
    </div>
  );
};

export default CustomBackground;
