import { Ear, Network, BrainCircuit, Languages } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Ear,
    title: "Context-Aware Ears",
    description:
      "Understands speech, emotion, accents, background noise, and social cues — like a human who never mishears.",
  },
  {
    icon: Network,
    title: "Audio Knowledge Graph",
    description:
      "Transforms raw audio into a living graph of people, moods, locations, events, and hidden signals.",
  },
  {
    icon: BrainCircuit,
    title: "Chain-of-Thought Reasoning",
    description:
      "Not just 'what happened' — but 'why it happened' using audio-driven reasoning flows.",
  },
  {
    icon: Languages,
    title: "Asian Multilingual Intelligence",
    description:
      "Understands Hindi, Tamil, Telugu, Bangla, Urdu, Mandarin, Korean — with cultural depth.",
  },
];

export function Features() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Intelligent Audio <span className="gradient-text">Processing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced features that decode the complexity of human communication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glass p-8 hover-tilt hover-glow cursor-pointer group transition-all duration-300"
            >
              <div className="relative inline-block mb-4">
                <feature.icon className="h-12 w-12 text-accent group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 blur-xl bg-accent/30 group-hover:bg-accent/50 transition-all" />
              </div>
              
              <h3 className="text-2xl font-semibold mb-3 group-hover:text-accent transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
