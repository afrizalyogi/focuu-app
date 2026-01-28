import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="relative z-10 flex items-center justify-center gap-8 py-8 border-t border-border/20 text-xs text-muted-foreground/40">
      <span>© focuu</span>
      <button
        onClick={() => navigate("/privacy")}
        className="hover:text-muted-foreground/60 transition-calm"
      >
        Privacy
      </button>
      <button
        onClick={() => navigate("/terms")}
        className="hover:text-muted-foreground/60 transition-calm"
      >
        Terms
      </button>
    </footer>
  );
};

export default Footer;
