import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CONTACT_INFO = [
  { icon: Mail, label: 'Email', value: 'contact@ggmaidan.com', href: 'mailto:contact@ggmaidan.com' },
  { icon: Phone, label: 'Phone', value: '+977-1-4GGMAIDAN', href: 'tel:+97714664243' },
  { icon: MapPin, label: 'Address', value: 'Kathmandu, Nepal', href: 'https://maps.google.com/?q=Kathmandu,Nepal' },
];

const SUBJECTS = [
  'Tournament Registration',
  'Sponsorship Inquiry',
  'Team Registration Help',
  'Technical Support',
  'Media & Press',
  'Other',
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Simulate submission (replace with real endpoint if available)
      await new Promise(r => setTimeout(r, 1200));
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  }

  const f = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value })),
  });

  const inputClass = "w-full bg-card/60 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors";

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="text-primary font-mono text-sm uppercase tracking-widest mb-3">Get in Touch</p>
          <h1 className="text-5xl md:text-6xl font-display font-black uppercase tracking-tight text-white mb-6">
            Contact Us
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Have a question about tournaments, partnerships, or anything else? We're here to help.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="font-display uppercase text-xl font-bold mb-6 text-white">Reach Us</h2>
              <div className="space-y-4">
                {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-4 p-4 rounded-xl bg-card/60 border border-white/10 hover:border-primary/30 hover:bg-white/5 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                      <p className="text-white font-medium">{value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
              <h3 className="font-display uppercase font-bold text-white mb-2">Join Our Community</h3>
              <p className="text-sm text-muted-foreground mb-4">Follow us for live updates, results, and news.</p>
              <div className="flex gap-3">
                {['Facebook', 'Instagram', 'Discord', 'YouTube'].map(s => (
                  <span key={s} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white cursor-pointer transition-colors">{s}</span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="lg:col-span-3 bg-card/60 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full gap-6 py-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <CheckCircle2 className="w-20 h-20 text-emerald-400" />
                </motion.div>
                <h3 className="font-display uppercase text-2xl font-bold text-white">Message Sent!</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  Thanks for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors">
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-display uppercase text-xl font-bold text-white mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Your Name *</label>
                      <input type="text" required {...f('name')} placeholder="Arjun Thapa" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Email *</label>
                      <input type="email" required {...f('email')} placeholder="you@example.com" className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Subject *</label>
                    <select required {...f('subject')} className={inputClass}>
                      <option value="">Select a subject…</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-muted-foreground uppercase tracking-wider mb-2">Message *</label>
                    <textarea required {...f('message')} rows={6} placeholder="Tell us how we can help…"
                      className={`${inputClass} resize-none`} />
                  </div>

                  {error && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-display uppercase tracking-widest font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send Message</>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
