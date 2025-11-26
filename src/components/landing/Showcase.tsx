import { Card } from "@/components/ui/card";

export function Showcase() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-accent/5" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            ALM-Asia Decodes the <span className="gradient-text">Chaos Around You</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Airports, markets, traffic, factories, temples, metros — sounds everywhere carry meaning. 
            ALM-Asia extracts it, stitches it, and delivers context no other AI model can.
          </p>
        </div>

        {/* Interactive diagram */}
        <div className="relative max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Speech Recognition", delay: "0s" },
              { label: "Emotion Detection", delay: "0.1s" },
              { label: "Context Analysis", delay: "0.2s" },
              { label: "Sound Classification", delay: "0.3s" },
              { label: "Cultural Understanding", delay: "0.4s" },
              { label: "Real-time Processing", delay: "0.5s" },
            ].map((item, index) => (
              <Card
                key={index}
                className="glass p-6 text-center hover:bg-accent/10 transition-all cursor-pointer group fade-in-up"
                style={{ animationDelay: item.delay }}
              >
                <div className="relative">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-6 h-6 rounded-full bg-accent pulse-glow" />
                  </div>
                  <p className="font-medium text-sm">{item.label}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Connecting lines animation */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full opacity-30">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                  <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="1" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
