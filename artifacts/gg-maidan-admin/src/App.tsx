import { useState, useEffect } from 'react';
import { authCheck } from '@/lib/api';
import Login from '@/pages/Login';
import PostStatus from '@/pages/PostStatus';

export default function App() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    authCheck().then(ok => setAuthed(ok));
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;
  return <PostStatus onLogout={() => setAuthed(false)} />;
}
