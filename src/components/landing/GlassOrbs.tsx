const GlassOrbs = () => {
  return (
    <>
      {/* Primary breathing orb - top left */}
      <div 
        className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "breathe-orb 6s ease-in-out infinite",
        }}
      />
      
      {/* Secondary breathing orb - bottom right */}
      <div 
        className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "breathe-orb 8s ease-in-out infinite",
          animationDelay: "2s",
        }}
      />
      
      {/* Accent orb - center */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)",
          filter: "blur(100px)",
          animation: "breathe-orb 10s ease-in-out infinite",
          animationDelay: "4s",
        }}
      />

      {/* Small floating orbs for depth */}
      <div 
        className="fixed top-1/3 right-1/3 w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(280 100% 70% / 0.1) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "float-orb 12s ease-in-out infinite",
        }}
      />
      
      <div 
        className="fixed bottom-1/3 left-1/3 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(142 71% 45% / 0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: "float-orb 15s ease-in-out infinite reverse",
        }}
      />

      {/* Glass overlay for depth */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, transparent 0%, hsl(var(--background) / 0.3) 100%)",
        }}
      />

      <style>{`
        @keyframes breathe-orb {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
        
        @keyframes float-orb {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.5;
          }
          25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-10px) translateX(-15px);
            opacity: 0.6;
          }
          75% {
            transform: translateY(15px) translateX(5px);
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  );
};

export default GlassOrbs;
