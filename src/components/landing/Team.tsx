import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const team = [
  {
    name: "Sanjay Kumar",
    role: "Backend Wizard",
    funFact: "Can optimize your API and finish a biriyani faster than you blink.",
    initials: "SK",
  },
  {
    name: "Priya Sharma",
    role: "ML Architect",
    funFact: "Trains models while training for marathons. Both finish at 99.9% accuracy.",
    initials: "PS",
  },
  {
    name: "Rahul Verma",
    role: "Frontend Ninja",
    funFact: "Writes CSS animations smoother than butter and debugs with eyes closed.",
    initials: "RV",
  },
  {
    name: "Aisha Patel",
    role: "Audio Engineer",
    funFact: "Can hear a bug in production from three offices away. Literally.",
    initials: "AP",
  },
];

export function Team() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in-up">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Meet the <span className="gradient-text">Dream Team</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The brilliant minds behind ALM-Asia
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {team.map((member, index) => (
            <Card
              key={index}
              className="glass p-6 text-center hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-accent/50 group-hover:border-accent transition-colors">
                <AvatarFallback className="text-2xl bg-accent/20 text-accent">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="text-xl font-semibold mb-1 group-hover:text-accent transition-colors">
                {member.name}
              </h3>
              
              <p className="text-sm text-accent mb-3">{member.role}</p>
              
              <p className="text-sm text-muted-foreground italic">
                "{member.funFact}"
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
