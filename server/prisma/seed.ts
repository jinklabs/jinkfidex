import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱  Seeding database…");

  // ── Quests ─────────────────────────────────────────────────────────────────
  // Chain-agnostic content — seed regardless of deployed contracts.
  const existing = await prisma.quest.count();
  if (existing > 0) {
    console.log(`  ⏭  Quests already seeded (${existing} found), skipping.`);
  } else {
    const now = new Date();
    const questsData = [
      {
        title: "JinkFi Genesis Campaign",
        description: "Be among the first to explore JinkFi DEX. Complete social, onchain and quiz tasks to earn exclusive genesis rewards.",
        projectName: "JinkFi",
        startDate: new Date(now.getTime() - 86400000 * 2),
        endDate:   new Date(now.getTime() + 86400000 * 30),
        featured: true,
        tags: ["DeFi", "DEX", "Genesis"],
        tasks: [
          { type: "twitter_follow",  title: "Follow @JinkFi on X",            description: "Follow the official JinkFi X account.",          points: 50,  required: true,  order: 1, link: "https://x.com/JinkFi" },
          { type: "twitter_retweet", title: "Retweet the launch post",         description: "Retweet the official JinkFi launch post on X.",   points: 75,  required: false, order: 2, link: "https://x.com/JinkFi" },
          { type: "discord_join",    title: "Join JinkFi Discord",             description: "Join the JinkFi community Discord server.",        points: 50,  required: true,  order: 3, link: "https://discord.gg/jinkfi" },
          { type: "quiz",            title: "What is concentrated liquidity?", description: "Answer a question about Uniswap V3.",              points: 100, required: false, order: 4, metadata: { options: ["Providing liquidity across the full price range", "Providing liquidity within a custom price range", "Locking tokens for a fixed period", "A type of yield farming strategy"], answer: "Providing liquidity within a custom price range" } },
          { type: "onchain",         title: "Make your first swap",            description: "Complete any token swap on JinkFi DEX.",           points: 150, required: false, order: 5 },
          { type: "onchain",         title: "Add liquidity",                   description: "Add liquidity to any pool on JinkFi.",             points: 75,  required: false, order: 6 },
        ],
        rewards: [
          { type: "token", symbol: "JINK", amount: "1000", label: "1,000 JINK" },
          { type: "nft",   label: "Genesis OG Badge NFT" },
        ],
      },
      {
        title: "Liquidity Provider Bootcamp",
        description: "Learn the difference between V2 and V3 concentrated liquidity. Earn rewards for providing liquidity on JinkFi.",
        projectName: "JinkFi",
        startDate: new Date(now.getTime() - 86400000 * 1),
        endDate:   new Date(now.getTime() + 86400000 * 21),
        featured: true,
        tags: ["Liquidity", "V2", "V3", "Education"],
        tasks: [
          { type: "quiz",           title: "V2 vs V3 liquidity",    description: "What is the main advantage of V3 over V2?",         points: 75,  required: false, order: 1, metadata: { options: ["V3 is cheaper to deploy", "V3 uses concentrated liquidity ranges", "V3 has lower gas fees", "V3 supports more tokens"], answer: "V3 uses concentrated liquidity ranges" } },
          { type: "onchain",        title: "Add V2 liquidity",       description: "Add liquidity to any V2 pool on JinkFi.",           points: 100, required: false, order: 2 },
          { type: "onchain",        title: "Create a V3 position",   description: "Open a concentrated liquidity V3 position.",        points: 150, required: false, order: 3 },
          { type: "twitter_follow", title: "Follow for LP tips",      description: "Follow @JinkFi for LP strategy updates.",          points: 50,  required: false, order: 4, link: "https://x.com/JinkFi" },
        ],
        rewards: [
          { type: "token", symbol: "JINK", amount: "750", label: "750 JINK" },
          { type: "nft",   label: "LP Master Badge" },
        ],
      },
      {
        title: "Token Locker Challenge",
        description: "Lock tokens or LP positions using JinkFi Locker — the non-custodial on-chain lock protocol.",
        projectName: "JinkFi Locker",
        startDate: new Date(now.getTime()),
        endDate:   new Date(now.getTime() + 86400000 * 30),
        featured: false,
        tags: ["Locker", "Security", "DeFi"],
        tasks: [
          { type: "onchain", title: "Lock any token",    description: "Lock any ERC-20 token using JinkFi Locker.",          points: 150, required: true,  order: 1 },
          { type: "quiz",    title: "Why lock tokens?",  description: "Understand the purpose of token locking.",            points: 100, required: false, order: 2, metadata: { options: ["To earn yield", "To signal commitment and prevent rug pulls", "To swap tokens", "To farm rewards"], answer: "To signal commitment and prevent rug pulls" } },
          { type: "twitter_follow", title: "Follow @JinkFi", description: "Follow the official JinkFi X account.",          points: 50,  required: false, order: 3, link: "https://x.com/JinkFi" },
        ],
        rewards: [
          { type: "token", symbol: "JINK", amount: "300", label: "300 JINK" },
        ],
      },
    ];

    for (const qd of questsData) {
      const totalPoints = qd.tasks.reduce((s, t) => s + t.points, 0);
      const quest = await prisma.quest.create({
        data: {
          title:       qd.title,
          description: qd.description,
          projectName: qd.projectName,
          startDate:   qd.startDate,
          endDate:     qd.endDate,
          featured:    qd.featured,
          tags:        qd.tags,
          totalPoints,
          tasks:   { create: qd.tasks },
          rewards: { create: qd.rewards },
        },
      });
      console.log(`  ✓  Quest: ${quest.title}`);
    }
  }

  // ── Pools & Farms ──────────────────────────────────────────────────────────
  // These are populated after contracts are deployed to Tempo (chainId 4217).
  // Run `npm run db:seed` again post-deployment to upsert real pool/farm data.
  const poolCount = await prisma.pool.count();
  const farmCount = await prisma.farm.count();
  console.log(`  ℹ  Pools: ${poolCount} (populate after Tempo contract deployment)`);
  console.log(`  ℹ  Farms: ${farmCount} (populate after Tempo contract deployment)`);

  console.log("\n✅  Seed complete.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
