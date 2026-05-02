import { cn } from "@/lib/utils";

export const LiquidGlassCard = ({
  children,
  className,
  glowIntensity = "md",
  shadowIntensity = "md",
  blurIntensity = "sm",
  borderRadius = "16px",
  draggable = false,
}) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{
        borderRadius,
      }}
    >
      {/* Glass Surface */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
