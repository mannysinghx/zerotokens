/**
 * src/data/fieldCategories.js
 * The 6 corporate field categories and their sub-functions/roles.
 * Used by the admin assignment modal and the seed script.
 */

export const FIELD_CATEGORIES = [
  {
    id: 'engineering_tech',
    name: 'Engineering & Tech',
    emoji: '⚙️',
    color: '#00d4ff',
    subFunctions: [
      {
        name: 'Software Engineering',
        roles: ['Junior Developer', 'Senior Developer', 'Staff Engineer', 'Engineering Manager'],
      },
      {
        name: 'DevOps & Infrastructure',
        roles: ['DevOps Engineer', 'SRE', 'Platform Engineer', 'Cloud Architect'],
      },
      {
        name: 'QA & Testing',
        roles: ['QA Engineer', 'SDET', 'QA Lead', 'Test Architect'],
      },
      {
        name: 'Data Engineering',
        roles: ['Data Engineer', 'Analytics Engineer', 'Data Architect'],
      },
      {
        name: 'Security & Compliance',
        roles: ['Security Engineer', 'Penetration Tester', 'Security Analyst', 'CISO'],
      },
      {
        name: 'IT Support & Operations',
        roles: ['IT Support Specialist', 'Systems Administrator', 'IT Manager'],
      },
    ],
  },
  {
    id: 'data_ai',
    name: 'Data & AI',
    emoji: '🧠',
    color: '#a855f7',
    subFunctions: [
      {
        name: 'Data Analysis & Analytics',
        roles: ['Data Analyst', 'Senior Analyst', 'Analytics Manager'],
      },
      {
        name: 'Machine Learning & AI',
        roles: ['ML Engineer', 'AI Researcher', 'Applied Scientist', 'ML Lead'],
      },
      {
        name: 'Business Intelligence',
        roles: ['BI Analyst', 'BI Developer', 'BI Manager'],
      },
      {
        name: 'Data Science',
        roles: ['Data Scientist', 'Senior Data Scientist', 'Principal Scientist'],
      },
      {
        name: 'AI Engineering',
        roles: ['AI Engineer', 'Prompt Engineer', 'LLM Engineer', 'AI Product Manager'],
      },
    ],
  },
  {
    id: 'product_design',
    name: 'Product & Design',
    emoji: '🎨',
    color: '#f59e0b',
    subFunctions: [
      {
        name: 'Product Management',
        roles: ['Associate PM', 'Product Manager', 'Senior PM', 'Group PM', 'CPO'],
      },
      {
        name: 'UX/UI Design',
        roles: ['UX Designer', 'UI Designer', 'Product Designer', 'Design Lead'],
      },
      {
        name: 'User Research',
        roles: ['UX Researcher', 'User Researcher', 'Research Lead'],
      },
      {
        name: 'Product Strategy & Roadmapping',
        roles: ['Product Strategist', 'Head of Product', 'VP Product'],
      },
      {
        name: 'Design Systems',
        roles: ['Design Systems Engineer', 'Design Technologist'],
      },
    ],
  },
  {
    id: 'go_to_market',
    name: 'Go-to-Market',
    emoji: '🚀',
    color: '#10b981',
    subFunctions: [
      {
        name: 'Marketing & Content',
        roles: ['Content Writer', 'Marketing Manager', 'Content Strategist', 'CMO'],
      },
      {
        name: 'Sales & Business Development',
        roles: ['SDR', 'Account Executive', 'Sales Manager', 'VP Sales'],
      },
      {
        name: 'Customer Success',
        roles: ['CSM', 'Senior CSM', 'CS Manager', 'VP Customer Success'],
      },
      {
        name: 'Growth & Demand Generation',
        roles: ['Growth Manager', 'Demand Gen Specialist', 'Performance Marketer'],
      },
      {
        name: 'Brand & Communications',
        roles: ['Brand Manager', 'PR Manager', 'Communications Lead'],
      },
    ],
  },
  {
    id: 'ops_finance_legal',
    name: 'Ops, Finance & Legal',
    emoji: '📊',
    color: '#ef4444',
    subFunctions: [
      {
        name: 'Operations & Process',
        roles: ['Operations Analyst', 'Operations Manager', 'COO'],
      },
      {
        name: 'Finance & Accounting',
        roles: ['Financial Analyst', 'FP&A Manager', 'Controller', 'CFO'],
      },
      {
        name: 'Legal & Compliance',
        roles: ['Legal Counsel', 'Compliance Officer', 'General Counsel'],
      },
      {
        name: 'Project Management',
        roles: ['Project Manager', 'Program Manager', 'PMO Lead'],
      },
      {
        name: 'Risk Management',
        roles: ['Risk Analyst', 'Risk Manager', 'Chief Risk Officer'],
      },
    ],
  },
  {
    id: 'people_culture',
    name: 'People & Culture',
    emoji: '🤝',
    color: '#ec4899',
    subFunctions: [
      {
        name: 'HR & Recruiting',
        roles: ['Recruiter', 'HR Business Partner', 'Talent Acquisition Manager', 'CHRO'],
      },
      {
        name: 'Learning & Development',
        roles: ['L&D Specialist', 'Training Manager', 'L&D Director'],
      },
      {
        name: 'People Operations',
        roles: ['People Ops Analyst', 'People Ops Manager', 'VP People'],
      },
      {
        name: 'Culture & Engagement',
        roles: ['Culture Manager', 'Employee Experience Lead', 'Engagement Specialist'],
      },
      {
        name: 'Compensation & Benefits',
        roles: ['Comp & Benefits Analyst', 'Total Rewards Manager'],
      },
    ],
  },
]

/** Quick lookup by id */
export const FIELD_CATEGORY_MAP = Object.fromEntries(FIELD_CATEGORIES.map(c => [c.id, c]))
