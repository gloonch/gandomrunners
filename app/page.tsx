import { About } from "@/components/landing/About";
import { Coach } from "@/components/landing/Coach";
import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { Nav } from "@/components/landing/Nav";
import { Schedule } from "@/components/landing/Schedule";
import { SmoothAnchors } from "@/components/landing/SmoothAnchors";

export default function Home() {
  return (
    <div className="page">
      <SmoothAnchors />
      <Nav />
      <Hero />
      <About />
      <Coach />
      <Schedule />
      <FinalCta />
    </div>
  );
}
