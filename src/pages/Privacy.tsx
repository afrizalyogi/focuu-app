import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GlassOrbs from "@/components/landing/GlassOrbs";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlassOrbs />
      <Navbar />

      <main className="relative z-10 flex-1 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground">
            <p className="text-lg text-foreground/80">
              Last updated: January 2026
            </p>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
              <p>
                focuu collects minimal information necessary to provide our service:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Email address when you create an account</li>
                <li><strong>Session Data:</strong> Work session duration, energy mode selected, and timestamps</li>
                <li><strong>Usage Data:</strong> Anonymous analytics to improve the service</li>
                <li><strong>Local Storage:</strong> Preferences and settings stored locally on your device</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
              <p>We use collected information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain the focuu service</li>
                <li>Track your work sessions and display history (for logged-in users)</li>
                <li>Improve our product based on aggregate usage patterns</li>
                <li>Send important service updates (with your consent)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. Data Storage & Security</h2>
              <p>
                Your data is stored securely using Supabase infrastructure. We implement industry-standard 
                security measures including encryption in transit and at rest. Anonymous users' data is 
                stored locally in their browser and is never transmitted to our servers.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. Data Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share 
                anonymous, aggregated data for research or analytics purposes.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Live Focus Chat</h2>
              <p>
                Messages sent in the Live Focus Chat are visible to other Pro users currently working. 
                Chat messages are ephemeral and not permanently stored. Do not share personal or 
                sensitive information in the chat.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Cookies & Tracking</h2>
              <p>
                focuu uses essential cookies for authentication and session management. We use anonymous 
                analytics to understand usage patterns. You can disable cookies in your browser settings, 
                though this may affect functionality.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Export your session history</li>
                <li>Opt out of non-essential communications</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Children's Privacy</h2>
              <p>
                focuu is not intended for users under 13 years of age. We do not knowingly collect 
                information from children under 13.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify users of any 
                material changes via email or through the service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">10. Contact Us</h2>
              <p>
                If you have questions about this privacy policy or your data, please contact us at{" "}
                <a href="mailto:privacy@focuu.site" className="text-primary hover:underline">
                  privacy@focuu.site
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
