import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Shell } from '@/components/layout/Shell';

// Pages
import Home from '@/pages/Home';
import Tournaments from '@/pages/Tournaments';
import TournamentDetail from '@/pages/TournamentDetail';
import Games from '@/pages/Games';
import Teams from '@/pages/Teams';
import TeamDetail from '@/pages/TeamDetail';
import Players from '@/pages/Players';
import PlayerDetail from '@/pages/PlayerDetail';
import Leaderboard from '@/pages/Leaderboard';
import Live from '@/pages/Live';
import News from '@/pages/News';
import NewsDetail from '@/pages/NewsDetail';
import Gallery from '@/pages/Gallery';
import Sponsors from '@/pages/Sponsors';
import About from '@/pages/About';
import Contact from '@/pages/Contact';

import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Shell>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/tournaments" component={Tournaments} />
              <Route path="/tournaments/:id" component={TournamentDetail} />
              <Route path="/games" component={Games} />
              <Route path="/teams" component={Teams} />
              <Route path="/teams/:id" component={TeamDetail} />
              <Route path="/players" component={Players} />
              <Route path="/players/:id" component={PlayerDetail} />
              <Route path="/leaderboard" component={Leaderboard} />
              <Route path="/live" component={Live} />
              <Route path="/news" component={News} />
              <Route path="/news/:id" component={NewsDetail} />
              <Route path="/gallery" component={Gallery} />
              <Route path="/sponsors" component={Sponsors} />
              <Route path="/about" component={About} />
              <Route path="/contact" component={Contact} />
              <Route component={NotFound} />
            </Switch>
          </Shell>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
