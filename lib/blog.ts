export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  readTime: string;
  category: 'security' | 'guides' | 'news' | 'education';
  image?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'what-is-wallet-reputation',
    title: 'What is Wallet Reputation and Why Does It Matter?',
    excerpt: 'Understanding on-chain reputation is crucial for safe Web3 interactions. Learn how wallet reputation works and why you should check it before transacting.',
    category: 'education',
    date: '2026-01-20',
    author: 'Vibe Check Team',
    readTime: '5 min read',
    content: `
# What is Wallet Reputation and Why Does It Matter?

In the world of Web3, trust is everything. Unlike traditional finance where banks verify identities, blockchain transactions are pseudonymous. This creates a challenge: how do you know if someone is trustworthy?

## The Problem with Anonymity

When you're about to:
- Send someone crypto for a trade
- Buy an NFT from a seller
- Interact with a new DeFi protocol

...you have no idea if the other party is legitimate or a scammer.

## Enter On-Chain Reputation

On-chain reputation systems analyze publicly available blockchain data to create trust signals. These include:

### Transaction History
- How long has the wallet been active?
- What protocols has it interacted with?
- Are there any suspicious patterns?

### Community Trust Signals
- Has anyone vouched for this address?
- Are there reviews from other users?
- What do other community members think?

### Protocol Interactions
- Does this wallet use established DeFi protocols?
- Has it participated in governance?
- Is there legitimate activity?

## How Vibe Check Helps

Vibe Check aggregates data from multiple sources to give you a quick reputation analysis:

1. **Ethos Network Score**: Community-driven trust score (0-2800)
2. **On-Chain Analysis**: Transaction count, wallet age, protocols used
3. **AI Insights**: Human-readable analysis of what the data means

## Best Practices

Before transacting with any unknown address:

1. ✅ Check their reputation score
2. ✅ Look at wallet age (older = more established)
3. ✅ Review transaction patterns
4. ✅ Look for community vouches
5. ✅ Trust your instincts

## Conclusion

Wallet reputation isn't perfect, but it's a valuable tool in your Web3 safety toolkit. Combined with common sense and due diligence, it can help you avoid scams and interact more safely.

---

*Stay safe out there, and always check the vibe before you transact!*
    `,
  },
  {
    slug: 'how-to-check-smart-contract-safety',
    title: 'How to Check if a Smart Contract is Safe',
    excerpt: 'Before interacting with a smart contract, here are the key security signals you should check to protect your funds.',
    category: 'security',
    date: '2026-01-18',
    author: 'Vibe Check Team',
    readTime: '7 min read',
    content: `
# How to Check if a Smart Contract is Safe

Smart contracts are the backbone of DeFi, NFTs, and most Web3 applications. But interacting with a malicious contract can drain your wallet in seconds. Here's how to evaluate contract safety.

## 1. Is the Source Code Verified?

The first thing to check is whether the contract's source code is verified on a block explorer like Basescan or Etherscan.

**Verified ✅**
- Source code is public and readable
- Anyone can audit the code
- More transparent and trustworthy

**Unverified ⚠️**
- Source code is hidden
- No way to inspect what the contract does
- Higher risk

## 2. Check the Contract Age

Newer contracts are riskier:
- **< 30 days**: Very new, limited track record
- **30-180 days**: Established but still relatively new
- **> 180 days**: Battle-tested over time

## 3. Look at Usage Statistics

A contract with many users and interactions has been "stress tested" by the community:
- **Unique Users**: How many different wallets have interacted?
- **Transaction Count**: Total number of interactions
- **Value Transferred**: How much value has flowed through?

## 4. Is it a Proxy Contract?

Proxy contracts can be upgraded, which means:
- The code can change after deployment
- The owner could introduce malicious code
- More trust is required in the contract owner

Look for proxy indicators and check who controls upgrades.

## 5. Known Protocols vs Unknown

Established protocols like Uniswap, Aave, or USDC have:
- Professional security audits
- Large user bases
- Proven track records

Unknown contracts require more scrutiny.

## Red Flags to Watch For

🚩 Unverified source code
🚩 Very new (< 7 days)
🚩 No users or interactions
🚩 Requesting unlimited token approvals
🚩 Owner has excessive permissions
🚩 No audit reports
🚩 Anonymous team

## Using Vibe Check for Contracts

When you enter a contract address in Vibe Check, we automatically detect it and show:
- Verification status
- Contract age
- Interaction count
- Unique users
- Proxy status
- Token info (if applicable)
- Known protocol identification

## Conclusion

Taking 30 seconds to check a contract can save you from losing everything. Always verify before you approve!

---

*Questions about a specific contract? Try checking it on Vibe Check!*
    `,
  },
  {
    slug: 'understanding-ethos-network',
    title: 'Understanding Ethos Network: The Trust Layer for Web3',
    excerpt: 'Learn how Ethos Network creates on-chain reputation through vouches, reviews, and community trust signals.',
    category: 'education',
    date: '2026-01-15',
    author: 'Vibe Check Team',
    readTime: '6 min read',
    content: `
# Understanding Ethos Network: The Trust Layer for Web3

Ethos Network is a decentralized reputation protocol that brings trust and accountability to Web3. Here's everything you need to know.

## What Problem Does Ethos Solve?

Web3 is pseudonymous by design. While this protects privacy, it also makes it hard to:
- Know if someone is trustworthy
- Build a reputation over time
- Hold bad actors accountable

Ethos creates an opt-in reputation layer where users can build and verify their trustworthiness.

## Core Features

### Vouching
Vouching is the strongest trust signal in Ethos. When you vouch for someone:
- You stake ETH as collateral
- Your reputation backs theirs
- If they behave badly, you could lose stake

This creates real accountability.

### Reviews
Anyone can leave a review on any address:
- **Positive**: Good experience
- **Neutral**: No strong opinion
- **Negative**: Bad experience

Reviews help others make informed decisions.

### Attestations
Link your on-chain identity to verified accounts:
- Twitter/X
- Discord
- Other social platforms

This proves you're a real person with an established presence.

### Credibility Score (0-2800)
Your score is calculated from:
- Vouches received (weighted by voucher quality)
- Reviews (positive vs negative)
- Attestations
- On-chain activity
- Time-weighted history

## Score Ranges

| Score | Rating | Meaning |
|-------|--------|---------|
| 2000-2800 | Excellent | Highly trusted |
| 1600-1999 | Good | Positive track record |
| 1200-1599 | Neutral | Limited history |
| 800-1199 | Questionable | Some concerns |
| 0-799 | Risky | Significant red flags |

## How to Build Your Reputation

1. **Create an Ethos Profile**: Visit ethos.network
2. **Verify Your Socials**: Link Twitter, Discord, etc.
3. **Be a Good Actor**: Positive interactions matter
4. **Get Vouches**: Ask trusted contacts to vouch for you
5. **Give Vouches**: Vouch for people you trust
6. **Stay Active**: Consistent positive activity helps

## Why Vibe Check Uses Ethos

Ethos provides the most comprehensive on-chain reputation data available. By integrating their API, we can give you:
- Real-time credibility scores
- Community trust signals
- Detailed reputation breakdowns

## Getting Started with Ethos

Ready to build your reputation?
1. Visit [ethos.network](https://ethos.network)
2. Connect your wallet
3. Create your profile
4. Start building trust!

---

*Your reputation is your most valuable asset in Web3. Start building it today!*
    `,
  },
  {
    slug: 'top-5-crypto-scams-and-how-to-avoid-them',
    title: 'Top 5 Crypto Scams in 2026 and How to Avoid Them',
    excerpt: 'Stay safe in Web3 by learning about the most common scams and how to protect yourself.',
    category: 'security',
    date: '2026-01-10',
    author: 'Vibe Check Team',
    readTime: '8 min read',
    content: `
# Top 5 Crypto Scams in 2026 and How to Avoid Them

Scammers are constantly evolving their tactics. Here are the most common scams we're seeing in 2026 and how to protect yourself.

## 1. Fake Airdrops

**How it works:**
- You receive tokens you didn't expect
- The token website asks you to "claim" rewards
- Connecting your wallet drains your funds

**How to avoid:**
- Never interact with unknown tokens
- Don't visit websites from random tokens
- Use Vibe Check to research unfamiliar contracts

## 2. Impersonation Scams

**How it works:**
- Scammer creates account impersonating a known person
- They offer "investment opportunities" or "giveaways"
- Victims send crypto expecting returns

**How to avoid:**
- Verify identity through multiple sources
- Check Ethos reputation scores
- Remember: legitimate people don't DM first

## 3. Phishing Sites

**How it works:**
- Fake websites that look like real protocols
- Often promoted through ads or social media
- Signing transactions drains your wallet

**How to avoid:**
- Bookmark official sites
- Double-check URLs carefully
- Never click links from DMs or emails

## 4. Rug Pulls

**How it works:**
- New token launches with hype
- Price pumps as people buy in
- Team drains liquidity and disappears

**How to avoid:**
- Research the team (are they doxxed?)
- Check contract for red flags
- Be skeptical of guaranteed returns

## 5. Approval Exploits

**How it works:**
- Malicious dApp requests unlimited token approval
- Later, they drain all approved tokens
- Victims don't realize until too late

**How to avoid:**
- Review all approval requests carefully
- Use limited approvals when possible
- Regularly revoke unnecessary approvals

## General Safety Tips

✅ Always check reputation before transacting
✅ Use hardware wallets for large amounts
✅ Never share your seed phrase
✅ Be skeptical of "too good to be true" offers
✅ Take your time - scammers create urgency
✅ Trust your instincts

## How Vibe Check Helps

Before any transaction:
1. Enter the address in Vibe Check
2. Review the reputation score
3. Check for red flags
4. Read the AI analysis
5. Make an informed decision

---

*Stay vigilant, and always check the vibe!*
    `,
  },
  {
    slug: 'how-to-be-a-good-onchain-citizen',
    title: 'How to Be a Good On-Chain Citizen',
    excerpt: 'Building a positive reputation in Web3 benefits everyone. Here\'s how to contribute to a healthier ecosystem.',
    category: 'guides',
    date: '2026-01-05',
    author: 'Vibe Check Team',
    readTime: '5 min read',
    content: `
# How to Be a Good On-Chain Citizen

Being a good on-chain citizen isn't just about avoiding scams - it's about contributing positively to the Web3 ecosystem. Here's how.

## Why It Matters

When everyone acts responsibly:
- Trust increases across the ecosystem
- Scammers have fewer victims
- DeFi and Web3 can grow sustainably
- Your own reputation benefits

## Best Practices

### 1. Be Honest in Reviews

When leaving reviews on Ethos:
- Be truthful about your experience
- Provide specific details
- Don't leave fake reviews (positive or negative)
- Help others make informed decisions

### 2. Vouch Responsibly

Only vouch for people you truly trust:
- Your reputation is on the line
- Bad vouches hurt the system
- Quality over quantity

### 3. Report Scams

When you encounter scams:
- Report to relevant platforms
- Leave negative reviews with evidence
- Warn others in community channels
- Help protect future victims

### 4. Verify Before Sharing

Before promoting a project:
- Do your own research
- Don't shill just for incentives
- Consider if you'd recommend to friends
- Be transparent about relationships

### 5. Educate Others

Help newcomers learn:
- Share security best practices
- Explain how to verify contracts
- Point them to tools like Vibe Check
- Be patient with questions

## Building Your Reputation

Good citizenship builds your reputation over time:

| Action | Impact |
|--------|--------|
| Honest reviews | Builds trust |
| Responsible vouches | Shows judgment |
| Helping others | Community recognition |
| Consistent activity | Proves reliability |
| Verified socials | Increases credibility |

## The Compound Effect

Every positive interaction:
- Improves your score
- Helps others make decisions
- Strengthens the ecosystem
- Attracts more legitimate users

## Conclusion

Web3 is what we make it. By being a good on-chain citizen, you're not just protecting yourself - you're building a better ecosystem for everyone.

---

*Be the change you want to see in Web3!*
    `,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPostsByCategory(category: BlogPost['category']): BlogPost[] {
  return blogPosts
    .filter(post => post.category === category)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
