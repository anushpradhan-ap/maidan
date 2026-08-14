-- Idempotent seed: 5 sample news posts (ON CONFLICT DO NOTHING on slug)
-- One post is marked is_breaking=true so the homepage banner has content on a fresh deploy.

INSERT INTO "news" ("title","slug","excerpt","content","category","author","status","is_breaking","tags","published_at","created_at") VALUES
(
  'PUBG Mobile Nationals 2026 — Registration Now Open!',
  'pubg-nationals-2026-registration',
  'The biggest PUBG Mobile tournament of the year is here. Sign up your squad before slots fill up.',
  'Get ready, Commanders. The G.G. Maidan PUBG Mobile Nationals 2026 has officially opened registrations.

With NPR 2,00,000 in prize money on the line and 32 squad slots available, this is the most competitive field we have ever assembled. Past champions DayLight X and Storm Raiders have already confirmed their return.

Head to the tournament page and fill in your team details. Registration closes once all 32 slots are filled.',
  'tournament','GG Maidan Team','published',true,
  ARRAY['PUBG Mobile','tournament','registration'],
  NOW(), NOW()
),
(
  'Free Fire Open — Champions Crowned After Intense Finals',
  'free-fire-open-champions-2026',
  'Team Phoenix emerged victorious at the Free Fire Open after a nail-biting 5-game series against Alpha Squad.',
  'The dust has settled on the Free Fire Open 2026 and one team stood above the rest — Team Phoenix.

Going into the Grand Finals as underdogs, Phoenix dismantled defending champion Alpha Squad 3-2 in a best-of-five series that kept over 4,000 live viewers on edge.

MVP of the tournament was "NepalKing", the in-game leader, who averaged 8.4 kills per match throughout the bracket.',
  'recap','GG Maidan Team','published',false,
  ARRAY['Free Fire','recap','champions'],
  NOW() - INTERVAL '3 days', NOW()
),
(
  'Valorant Invitational Coming This September',
  'valorant-invitational-september-2026',
  'By invitation only — the top 8 Valorant teams in Nepal battle it out for ultimate bragging rights.',
  'We are thrilled to announce the first-ever G.G. Maidan Valorant Invitational, scheduled for September 2026.

Unlike our open tournaments, this event is invitation-only. The top 8 ranked Valorant teams in Nepal have been identified based on performance across the 2026 season.

Prize Pool: NPR 1,50,000 split across top 4 finishers. Double elimination bracket. All matches best-of-three except the Grand Final which is best-of-five.',
  'announcement','GG Maidan Team','published',false,
  ARRAY['Valorant','announcement','invitational'],
  NOW() - INTERVAL '7 days', NOW()
),
(
  'How Nepal''s Esports Scene Grew 300% in 2025',
  'nepal-esports-growth-2025',
  'A deep dive into the numbers behind Nepal''s fastest-growing competitive gaming ecosystem.',
  'The numbers are in and they are staggering. Nepal''s esports scene grew by over 300% in 2025.

At G.G. Maidan alone, we hosted 12 major tournaments with over 800 unique team registrations. Total prize money distributed crossed NPR 10,00,000 for the first time.

Wider smartphone penetration, a new generation of streamers, and telecom sponsors entering the space all drove the growth. 2026 is shaping up to be even bigger.',
  'gaming','GG Maidan Research','published',false,
  ARRAY['Nepal','esports','growth','analysis'],
  NOW() - INTERVAL '14 days', NOW()
),
(
  'Patch 3.2 Changes Every Competitive PUBG Player Needs to Know',
  'pubg-mobile-patch-3-2-breakdown',
  'The new patch shakes up rotations, nerfs SMGs, and introduces a controversial new zone mechanic.',
  'Patch 3.2 dropped this week and the meta is shifting.

The new soft pull zone mechanic subtly nudges the playzone toward areas with fewer remaining teams. The UMP45 damage drop has been reduced by 12% at ranges beyond 30m. The Vector magazine capacity has been cut to 25 (was 33).

Vehicle spawns on Miramar have increased by 20%. A net positive patch for competitive integrity.',
  'patch','GG Maidan Analyst','published',false,
  ARRAY['PUBG Mobile','patch notes','meta'],
  NOW() - INTERVAL '2 days', NOW()
)
ON CONFLICT (slug) DO NOTHING;
