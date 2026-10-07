import { Button } from "@/components/ds/Button";
import { MESSAGE_HREF } from "@/lib/content";

export function FinalCta() {
  return (
    <section id="contact" className="contact">
      <div className="cta-photo" role="img" aria-label="Gandom Runners members running together on the track" />
      <div className="cta-stage">
        <div className="cta-copy">
          <div className="eyebrow">Join</div>
          <h2>
            You don’t
            <br />
            run <i>alone.</i>
          </h2>
          <p>Want to start, keep going, and find a real group to run with? See the schedule, then message us to sign up.</p>
          <div className="cta-actions">
            <Button variant="primary" size="lg" href="#schedule">
              See the schedule
            </Button>
            <Button variant="dark" size="lg" href={MESSAGE_HREF} icon="brand-instagram">
              Message on Instagram
            </Button>
          </div>
        </div>
      </div>
      <footer className="footer">
        <img src="/images/logo.png" alt="Gandom Runners" />
        <span>Gandom Runners · Tehran · Run with direction.</span>
      </footer>
    </section>
  );
}
