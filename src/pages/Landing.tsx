import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Showcase } from "@/components/landing/Showcase";
import { Demo } from "@/components/landing/Demo";
import { Team } from "@/components/landing/Team";
import { Lanyard } from "@/components/landing/Lanyard";
import { Footer } from "@/components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Showcase />
      <Demo />
      <Team />
      <Lanyard />
      <Footer />
    </div>
  );
}
