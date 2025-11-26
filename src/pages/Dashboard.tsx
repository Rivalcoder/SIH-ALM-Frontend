import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Upload, Activity, FileAudio, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Total Analyses", value: "1,234", icon: Activity, trend: "+12%" },
  { label: "Audio Files", value: "456", icon: FileAudio, trend: "+8%" },
  { label: "Processing Time", value: "2.3s", icon: Clock, trend: "-15%" },
  { label: "Active Projects", value: "12", icon: Upload, trend: "+3" },
];

const recentAnalyses = [
  { id: 1, name: "customer_call_001.mp3", status: "Completed", time: "2 min ago" },
  { id: 2, name: "meeting_audio.wav", status: "Processing", time: "5 min ago" },
  { id: 3, name: "interview_final.m4a", status: "Completed", time: "1 hour ago" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="fade-in-up">
          <h1 className="text-4xl font-bold mb-2">Your Audio Intelligence Hub</h1>
          <p className="text-muted-foreground mb-8">
            Monitor and manage all your audio analyses in one place
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stagger-children">
            {stats.map((stat, index) => (
              <Card key={index} className="glass p-6 hover-glow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="h-8 w-8 text-accent" />
                  <span className="text-sm font-medium text-accent">{stat.trend}</span>
                </div>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Upload Section */}
          <Card className="glass p-8 mb-8 hover-tilt">
            <h2 className="text-2xl font-semibold mb-4">Quick Upload</h2>
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-accent transition-all cursor-pointer group">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground group-hover:text-accent transition-colors" />
              <p className="text-lg mb-2">Drag & drop your audio file here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Choose File
              </Button>
            </div>
          </Card>

          {/* Recent Analyses */}
          <Card className="glass p-8">
            <h2 className="text-2xl font-semibold mb-6">Recent Analyses</h2>
            <div className="space-y-4">
              {recentAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-accent/5 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <FileAudio className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">{analysis.name}</p>
                      <p className="text-sm text-muted-foreground">{analysis.time}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      analysis.status === "Completed"
                        ? "bg-accent/20 text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {analysis.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
