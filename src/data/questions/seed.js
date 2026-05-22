/**
 * seed.js
 * One-time script to seed categories + all 600 questions into Neon PostgreSQL.
 *
 * Usage:
 *   node src/data/questions/seed.js
 *
 * Requires DATABASE_URL_UNPOOLED in .env.local (or environment).
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import postgres from 'postgres'

// Load .env.local if running locally
try {
  const { config } = await import('dotenv')
  config({ path: '.env.local' })
} catch {}

const __dirname = dirname(fileURLToPath(import.meta.url))

const CATEGORIES = [
  {
    id: 'engineering_tech',
    name: 'Engineering & Tech',
    subFunctions: [
      { name: 'Software Engineering',   roles: ['Junior Developer','Senior Developer','Staff Engineer','Engineering Manager'] },
      { name: 'DevOps & Infrastructure',roles: ['DevOps Engineer','SRE','Platform Engineer','Cloud Architect'] },
      { name: 'QA & Testing',           roles: ['QA Engineer','SDET','QA Lead','Test Architect'] },
      { name: 'Data Engineering',       roles: ['Data Engineer','Analytics Engineer','Data Architect'] },
      { name: 'Security & Compliance',  roles: ['Security Engineer','Penetration Tester','Security Analyst','CISO'] },
      { name: 'IT Support & Operations',roles: ['IT Support Specialist','Systems Administrator','IT Manager'] },
    ],
  },
  {
    id: 'data_ai',
    name: 'Data & AI',
    subFunctions: [
      { name: 'Data Analysis & Analytics', roles: ['Data Analyst','Senior Analyst','Analytics Manager'] },
      { name: 'Machine Learning & AI',     roles: ['ML Engineer','AI Researcher','Applied Scientist','ML Lead'] },
      { name: 'Business Intelligence',     roles: ['BI Analyst','BI Developer','BI Manager'] },
      { name: 'Data Science',              roles: ['Data Scientist','Senior Data Scientist','Principal Scientist'] },
      { name: 'AI Engineering',            roles: ['AI Engineer','Prompt Engineer','LLM Engineer','AI Product Manager'] },
    ],
  },
  {
    id: 'product_design',
    name: 'Product & Design',
    subFunctions: [
      { name: 'Product Management',            roles: ['Associate PM','Product Manager','Senior PM','Group PM','CPO'] },
      { name: 'UX/UI Design',                  roles: ['UX Designer','UI Designer','Product Designer','Design Lead'] },
      { name: 'User Research',                 roles: ['UX Researcher','User Researcher','Research Lead'] },
      { name: 'Product Strategy & Roadmapping',roles: ['Product Strategist','Head of Product','VP Product'] },
      { name: 'Design Systems',                roles: ['Design Systems Engineer','Design Technologist'] },
    ],
  },
  {
    id: 'go_to_market',
    name: 'Go-to-Market',
    subFunctions: [
      { name: 'Marketing & Content',        roles: ['Content Writer','Marketing Manager','Content Strategist','CMO'] },
      { name: 'Sales & Business Development',roles: ['SDR','Account Executive','Sales Manager','VP Sales'] },
      { name: 'Customer Success',            roles: ['CSM','Senior CSM','CS Manager','VP Customer Success'] },
      { name: 'Growth & Demand Generation',  roles: ['Growth Manager','Demand Gen Specialist','Performance Marketer'] },
      { name: 'Brand & Communications',      roles: ['Brand Manager','PR Manager','Communications Lead'] },
    ],
  },
  {
    id: 'ops_finance_legal',
    name: 'Ops, Finance & Legal',
    subFunctions: [
      { name: 'Operations & Process', roles: ['Operations Analyst','Operations Manager','COO'] },
      { name: 'Finance & Accounting', roles: ['Financial Analyst','FP&A Manager','Controller','CFO'] },
      { name: 'Legal & Compliance',   roles: ['Legal Counsel','Compliance Officer','General Counsel'] },
      { name: 'Project Management',   roles: ['Project Manager','Program Manager','PMO Lead'] },
      { name: 'Risk Management',      roles: ['Risk Analyst','Risk Manager','Chief Risk Officer'] },
    ],
  },
  {
    id: 'people_culture',
    name: 'People & Culture',
    subFunctions: [
      { name: 'HR & Recruiting',       roles: ['Recruiter','HR Business Partner','Talent Acquisition Manager','CHRO'] },
      { name: 'Learning & Development',roles: ['L&D Specialist','Training Manager','L&D Director'] },
      { name: 'People Operations',     roles: ['People Ops Analyst','People Ops Manager','VP People'] },
      { name: 'Culture & Engagement',  roles: ['Culture Manager','Employee Experience Lead','Engagement Specialist'] },
      { name: 'Compensation & Benefits',roles: ['Comp & Benefits Analyst','Total Rewards Manager'] },
    ],
  },
]

const QUESTION_FILES = [
  { file: 'engineering-tech.json', categoryId: 'engineering_tech' },
  { file: 'data-ai.json',          categoryId: 'data_ai'          },
  { file: 'product-design.json',   categoryId: 'product_design'   },
  { file: 'go-to-market.json',     categoryId: 'go_to_market'     },
  { file: 'ops-finance-legal.json',categoryId: 'ops_finance_legal' },
  { file: 'people-culture.json',   categoryId: 'people_culture'   },
]

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!connectionString) {
  console.error('ERROR: DATABASE_URL_UNPOOLED not set. Add it to .env.local')
  process.exit(1)
}

const sql = postgres(connectionString, { ssl: 'require' })

async function seed() {
  console.log('🌱 Seeding TokenQuest database…\n')

  // 1. Upsert categories
  console.log('Upserting categories…')
  for (const cat of CATEGORIES) {
    await sql`
      INSERT INTO categories (id, name, sub_functions)
      VALUES (${cat.id}, ${cat.name}, ${JSON.stringify(cat.subFunctions)})
      ON CONFLICT (id) DO UPDATE
        SET name          = EXCLUDED.name,
            sub_functions = EXCLUDED.sub_functions
    `
    console.log(`  ✓ ${cat.name}`)
  }

  // 2. Seed questions
  console.log('\nSeeding questions…')
  let totalInserted = 0

  for (const { file, categoryId } of QUESTION_FILES) {
    const filePath = join(__dirname, file)
    let questions
    try {
      questions = JSON.parse(readFileSync(filePath, 'utf8'))
    } catch {
      console.warn(`  ⚠ Skipping ${file} — file not found or invalid JSON`)
      continue
    }

    // Delete existing questions for this category (fresh seed)
    await sql`DELETE FROM questions WHERE category_id = ${categoryId}`

    // Insert in batches of 50
    const batchSize = 50
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize)
      for (const q of batch) {
        await sql`
          INSERT INTO questions
            (category_id, sub_function, mode, difficulty, title,
             original_prompt, options, correct_option, reward_coins, hint, max_tokens)
          VALUES
            (${q.categoryId ?? categoryId},
             ${q.subFunction},
             ${q.mode},
             ${q.difficulty},
             ${q.title},
             ${q.originalPrompt},
             ${JSON.stringify(q.options)},
             ${q.correctOption},
             ${q.rewardCoins ?? 80},
             ${q.hint ?? null},
             ${q.maxTokens ?? null})
        `
      }
    }

    console.log(`  ✓ ${file} — ${questions.length} questions`)
    totalInserted += questions.length
  }

  console.log(`\n✅ Done! ${totalInserted} questions seeded across ${QUESTION_FILES.length} categories.`)
  await sql.end()
}

seed().catch(err => {
  console.error('Seed failed:', err.message)
  sql.end()
  process.exit(1)
})
