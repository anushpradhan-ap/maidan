import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We've received your inquiry and will get back to you soon.",
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight mb-4">
          Contact Us
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Have a question about a tournament? Want to partner with us? Drop us a line.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <Card className="glass-card border-white/10">
          <CardContent className="p-8">
            <h3 className="text-2xl font-display font-bold uppercase mb-6 text-white">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">First Name</label>
                  <Input required placeholder="John" className="bg-black/50 border-white/10 focus-visible:ring-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Last Name</label>
                  <Input required placeholder="Doe" className="bg-black/50 border-white/10 focus-visible:ring-primary" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Email</label>
                <Input required type="email" placeholder="john@team.com" className="bg-black/50 border-white/10 focus-visible:ring-primary" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Subject</label>
                <Input required placeholder="Tournament Inquiry" className="bg-black/50 border-white/10 focus-visible:ring-primary" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Message</label>
                <Textarea required placeholder="How can we help you?" className="min-h-[150px] bg-black/50 border-white/10 focus-visible:ring-primary" />
              </div>

              <Button type="submit" className="w-full h-12 mt-4 font-display uppercase tracking-widest font-bold bg-primary hover:bg-primary/90 text-white">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="space-y-8">
          <Card className="glass-card border-white/5 bg-white/5">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-display font-bold uppercase mb-1">Email Us</h4>
                <p className="text-muted-foreground text-sm mb-2">For general inquiries and support.</p>
                <a href="mailto:support@ggmaidan.com" className="text-white hover:text-primary font-mono">support@ggmaidan.com</a>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 bg-white/5">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h4 className="font-display font-bold uppercase mb-1">Call Us</h4>
                <p className="text-muted-foreground text-sm mb-2">Mon-Fri from 10am to 6pm NPT.</p>
                <a href="tel:+9779800000000" className="text-white hover:text-secondary font-mono">+977 980-000-0000</a>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5 bg-white/5">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-display font-bold uppercase mb-1">HQ</h4>
                <p className="text-muted-foreground text-sm mb-2">Come visit our local office.</p>
                <address className="text-white not-italic text-sm">
                  Kathmandu, Nepal<br />
                  Bagmati Province, 44600
                </address>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
