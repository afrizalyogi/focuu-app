import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import GlassOrbs from "@/components/landing/GlassOrbs";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlassOrbs />
      <Navbar />

      <main className="relative z-10 flex-1 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground">
            <p className="text-lg text-foreground/80">
              Last updated: January 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By accessing or using focuu ("the Service"), you agree to be bound by these Terms of 
                Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
              <p>
                focuu is a calm workspace application designed to help users focus on their work. 
                The Service includes work session timers, task planning, presence indicators, and 
                community features for Pro users.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. Account Registration</h2>
              <p>
                You may use focuu without an account with limited features. To access full features 
                and session history, you must create an account. You are responsible for maintaining 
                the security of your account credentials.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. Free and Pro Plans</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Free Plan:</strong> Basic timer, single task focus, local session history</li>
                <li><strong>Pro Plan:</strong> Extended features including multiple tasks, Live Focus Chat, 
                saved work modes, cloud sync, and priority support</li>
              </ul>
              <p>
                Pro subscriptions are billed monthly or annually. Prices are subject to change with 
                30 days notice to existing subscribers.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the Service for any illegal purpose</li>
                <li>Harass, abuse, or harm other users through the Live Focus Chat</li>
                <li>Attempt to gain unauthorized access to the Service or its systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Impersonate any person or entity</li>
                <li>Share content that is offensive, harmful, or violates others' rights</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Live Focus Chat Guidelines</h2>
              <p>
                The Live Focus Chat is designed for brief, encouraging messages among users currently 
                working. Messages are subject to rate limiting (1 message per 2 minutes) and character 
                limits (140 characters). Content that violates community guidelines will result in 
                account suspension.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by focuu 
                and are protected by international copyright, trademark, and other intellectual 
                property laws.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Termination</h2>
              <p>
                We reserve the right to terminate or suspend your account at any time for violations 
                of these Terms. You may cancel your account at any time through the Settings page. 
                Upon cancellation, your data will be retained for 30 days before permanent deletion.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Disclaimer of Warranties</h2>
              <p>
                The Service is provided "as is" without warranties of any kind. We do not guarantee 
                that the Service will be uninterrupted, secure, or error-free. focuu is a productivity 
                tool and makes no claims about improving your work performance.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">10. Limitation of Liability</h2>
              <p>
                In no event shall focuu be liable for any indirect, incidental, special, consequential, 
                or punitive damages arising from your use of the Service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">11. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any 
                material changes. Continued use of the Service after changes constitutes acceptance 
                of the new Terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">12. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with applicable laws, 
                without regard to conflict of law principles.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">13. Contact</h2>
              <p>
                For questions about these Terms, please contact us at{" "}
                <a href="mailto:legal@focuu.site" className="text-primary hover:underline">
                  legal@focuu.site
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
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
          className="text-foreground/60"
        >
          Terms
        </button>
      </footer>
    </div>
  );
};

export default Terms;