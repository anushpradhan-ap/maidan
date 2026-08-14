/**
 * Run once to insert sample news posts:
 *   pnpm --filter @workspace/api-server tsx src/seed-news.ts
 */
import { db, newsTable } from '@workspace/db';

const posts = [
  {
    title: 'PUBG Mobile Nationals 2026 — Registration Now Open!',
    slug: 'pubg-nationals-2026-registration',
    excerpt: 'The biggest PUBG Mobile tournament of the year is here. Sign up your squad before slots fill up.',
    content: [
      'Get ready, Commanders. The G.G. Maidan PUBG Mobile Nationals 2026 has officially opened registrations.',
      'With NPR 2,00,000 in prize money on the line and 32 squad slots available, this is the most competitive field we have ever assembled.',
      'Past champions DayLight X and Storm Raiders have already confirmed their return.',
      'Head to the tournament page and fill in your team details. Registration closes once all 32 slots are filled.',
    ].join('\n\n'),
    category: 'tournament',
    author: 'GG Maidan Team',
    status: 'published',
    isBreaking: true,
    tags: ['PUBG Mobile', 'tournament', 'registration'],
    publishedAt: new Date().toISOString(),
  },
  {
    title: 'Free Fire Open — Champions Crowned After Intense Finals',
    slug: 'free-fire-open-champions-2026',
    excerpt: 'Team Phoenix emerged victorious at the Free Fire Open after a nail-biting 5-game series against Alpha Squad.',
    content: [
      'The dust has settled on the Free Fire Open 2026 and one team stood above the rest — Team Phoenix.',
      'Going into the Grand Finals as underdogs, Phoenix dismantled defending champion Alpha Squad 3-2 in a best-of-five series that kept over 4,000 live viewers on edge.',
      'MVP of the tournament was "NepalKing", Phoenix\'s in-game leader, who averaged 8.4 kills per match throughout the bracket.',
    ].join('\n\n'),
    category: 'recap',
    author: 'GG Maidan Team',
    status: 'published',
    isBreaking: false,
    tags: ['Free Fire', 'recap', 'champions'],
    publishedAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
  },
  {
    title: 'Valorant Invitational Coming This September',
    slug: 'valorant-invitational-september-2026',
    excerpt: 'By invitation only — the top 8 Valorant teams in Nepal battle it out for ultimate bragging rights.',
    content: [
      'We are thrilled to announce the first-ever G.G. Maidan Valorant Invitational, scheduled for September 2026.',
      'Unlike our open tournaments, this event is invitation-only. The top 8 ranked Valorant teams in Nepal have been identified based on performance across the 2026 season.',
      'Prize Pool: NPR 1,50,000 split across top 4 finishers. Double elimination bracket. All matches best-of-three except the Grand Final which is best-of-five.',
    ].join('\n\n'),
    category: 'announcement',
    author: 'GG Maidan Team',
    status: 'published',
    isBreaking: false,
    tags: ['Valorant', 'announcement', 'invitational'],
    publishedAt: new Date(Date.now() - 7 * 86400_000).toISOString(),
  },
  {
    title: "How Nepal's Esports Scene Grew 300% in 2025",
    slug: 'nepal-esports-growth-2025',
    excerpt: "A deep dive into the numbers behind Nepal's fastest-growing competitive gaming ecosystem.",
    content: [
      "The numbers are in and they are staggering. Nepal's esports scene grew by over 300% in 2025.",
      'At G.G. Maidan alone, we hosted 12 major tournaments with over 800 unique team registrations.',
      'Total prize money distributed crossed NPR 10,00,000 for the first time.',
    ].join('\n\n'),
    category: 'gaming',
    author: 'GG Maidan Research',
    status: 'published',
    isBreaking: false,
    tags: ['Nepal', 'esports', 'growth', 'analysis'],
    publishedAt: new Date(Date.now() - 14 * 86400_000).toISOString(),
  },
  {
    title: 'Patch 3.2 Changes Every Competitive PUBG Player Needs to Know',
    slug: 'pubg-mobile-patch-3-2-breakdown',
    excerpt: 'The new patch shakes up rotations, nerfs SMGs, and introduces a controversial new zone mechanic.',
    content: [
      'Patch 3.2 dropped this week and the meta is shifting.',
      'The new soft pull zone mechanic subtly nudges the playzone toward areas with fewer remaining teams.',
      'The UMP45 damage drop has been reduced by 12% at ranges beyond 30m. The Vector magazine capacity has been cut to 25 (was 33).',
      'Vehicle spawns on Miramar have increased by 20%. A net positive patch for competitive integrity.',
    ].join('\n\n'),
    category: 'patch',
    author: 'GG Maidan Analyst',
    status: 'published',
    isBreaking: false,
    tags: ['PUBG Mobile', 'patch notes', 'meta'],
    publishedAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
  },
];

async function main() {
  console.log('Seeding news posts…');
  for (const post of posts) {
    await db.insert(newsTable).values(post as any).onConflictDoNothing().execute();
    console.log('  ✓', post.title);
  }
  console.log('Done!');
  process.exit(0);
}

main().catch((err: unknown) => { console.error(err); process.exit(1); });
