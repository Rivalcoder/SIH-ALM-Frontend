import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/landing/Hero";
import dynamic from "next/dynamic";

// Lazy load below-the-fold components for better initial page load
const Features = dynamic(() => import("@/components/landing/Features").then(mod => ({ default: mod.Features })), {
  loading: () => <div className="min-h-screen" />,
});

const Showcase = dynamic(() => import("@/components/landing/Showcase").then(mod => ({ default: mod.Showcase })), {
  loading: () => <div className="min-h-screen" />,
});

const Demo = dynamic(() => import("@/components/landing/Demo").then(mod => ({ default: mod.Demo })), {
  loading: () => <div className="min-h-screen" />,
});

const Team = dynamic(() => import("@/components/landing/Team").then(mod => ({ default: mod.Team })), {
  loading: () => <div className="min-h-screen" />,
});

const Lanyard = dynamic(() => import("@/components/landing/Lanyard").then(mod => ({ default: mod.Lanyard })), {
  loading: () => <div className="min-h-screen" />,
});

const ReadyToDive = dynamic(() => import("@/components/landing/ReadyToDive").then(mod => ({ default: mod.ReadyToDive })), {
  loading: () => <div className="min-h-screen" />,
});

const Footer = dynamic(() => import("@/components/landing/Footer").then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-32" />,
});

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
      <ReadyToDive />
      <Footer />
    </div>
  );
}
