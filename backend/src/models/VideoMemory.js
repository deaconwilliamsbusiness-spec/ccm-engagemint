// Temporary in-memory storage for videos (no database required)
// This allows testing without PostgreSQL setup

let videos = []
let videoIdCounter = 1

// Initialize with demo content
const initDemoContent = () => {
  const demoVideos = [
    {
      title: 'When you finally understand bonding curves 🚀',
      description: 'That moment when it all clicks and you realize how revolutionary tokenized social media really is! $PUMP to the moon!',
      video_url: 'https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.mp4',
      username: 'pumpmaster',
      creator_token: 'PUMP',
      profile_image: '🚀',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 2
    },
    {
      title: 'Just launched my creator token! 💎 Who\'s buying?',
      description: 'Dropped my token on CCM ENGAGEMINT! Early holders get exclusive content access. LFG! $KING',
      video_url: 'https://media.giphy.com/media/3ohhwxqQJzrSXnvWoM/giphy.mp4',
      username: 'cryptoking_',
      creator_token: 'KING',
      profile_image: '👑',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 4
    },
    {
      title: 'My reaction when my token hits 100x 📈',
      description: 'Started from the bottom now we here! Thanks to all my token holders. Next stop: moon! $MOON',
      video_url: 'https://media.giphy.com/media/Pk5Hqd2lBFGU/giphy.mp4',
      username: 'moonwalker',
      creator_token: 'MOON',
      profile_image: '🌙',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 6
    },
    {
      title: 'Building in public: Day 30 of my Web3 journey 🛠️',
      description: 'Learning, building, and tokenizing every step of the way. Join my community! $BUILD',
      video_url: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.mp4',
      username: 'builder_dao',
      creator_token: 'BUILD',
      profile_image: '🛠️',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 8
    },
    {
      title: 'When someone asks if I\'m bullish on social tokens 🐂',
      description: 'Is water wet? Of course I\'m bullish! Social tokens are the future of creator economy. $BULL',
      video_url: 'https://media.giphy.com/media/l0IydexDDfhqQGmVG/giphy.mp4',
      username: 'bullmarket_bae',
      creator_token: 'BULL',
      profile_image: '🐂',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 10
    },
    {
      title: 'POV: You discover bonding curves at 3 AM 🧠',
      description: 'Mind = blown. This changes everything. Who else is staying up late researching DeFi? $ALPHA',
      video_url: 'https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.mp4',
      username: 'alpha_hunter',
      creator_token: 'ALPHA',
      profile_image: '🧠',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 12
    },
    {
      title: 'My portfolio after joining CCM ENGAGEMINT 💰',
      description: 'Never looking back. Best decision I made in crypto. Building my creator empire one token at a time! $WINS',
      video_url: 'https://media.giphy.com/media/67ThRZlYBvibtdF9JH/giphy.mp4',
      username: 'winning_daily',
      creator_token: 'WINS',
      profile_image: '💰',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 14
    },
    {
      title: 'Teaching my grandma about tokenized communities 👵',
      description: 'Even she gets it! The future is here and it\'s decentralized. $TEACH',
      video_url: 'https://media.giphy.com/media/3o6Zt3LdsGts11udSU/giphy.mp4',
      username: 'teach_defi',
      creator_token: 'TEACH',
      profile_image: '👵',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 16
    },
    {
      title: 'When your token holders are more loyal than your friends 🤝',
      description: 'Real recognize real. Shoutout to my amazing community! We\'re building something special here. $LOYAL',
      video_url: 'https://media.giphy.com/media/l3V0dy1zzyjbYTQQM/giphy.mp4',
      username: 'loyal_legion',
      creator_token: 'LOYAL',
      profile_image: '🤝',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 18
    },
    {
      title: 'Just aped into 5 new creator tokens 🦍',
      description: 'YOLO mode activated. Supporting my favorite creators on CCM! Who should I ape into next? $APE',
      video_url: 'https://media.giphy.com/media/YYfEjWVqZ6NDG/giphy.mp4',
      username: 'ape_together',
      creator_token: 'APE',
      profile_image: '🦍',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 20
    },
    {
      title: 'The look when you check your token price after sleeping 😴',
      description: 'Woke up to 50% gains! Love this platform. Sleep > Trading anxiety. $CHILL',
      video_url: 'https://media.giphy.com/media/3o7qDEq2bMbcbPRQ2c/giphy.mp4',
      username: 'chill_trader',
      creator_token: 'CHILL',
      profile_image: '😴',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 22
    },
    {
      title: 'Creating content + earning tokens = Dream combo ✨',
      description: 'Why didn\'t this exist sooner? Monetizing my creativity has never been easier! $DREAM',
      video_url: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.mp4',
      username: 'dream_creator',
      creator_token: 'DREAM',
      profile_image: '✨',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 24
    },
    {
      title: 'Token-gated community perks are INSANE 🎁',
      description: 'Exclusive alpha, early access, private events... This is the future of fan engagement! $PERKS',
      video_url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.mp4',
      username: 'perks_master',
      creator_token: 'PERKS',
      profile_image: '🎁',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 26
    },
    {
      title: 'Me explaining social tokens to my normie friends 🤓',
      description: 'They still don\'t get it, but they will. We\'re so early! $EARLY',
      video_url: 'https://media.giphy.com/media/l0HlRnAWXxn0MhKLK/giphy.mp4',
      username: 'early_adopter',
      creator_token: 'EARLY',
      profile_image: '🤓',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 28
    },
    {
      title: 'From zero to hero: My first month as a creator 🌟',
      description: 'Started with nothing, now I have a thriving community of 500+ token holders! $HERO',
      video_url: 'https://media.giphy.com/media/3o7qDSOvfaCO9b3MlO/giphy.mp4',
      username: 'zero_to_hero',
      creator_token: 'HERO',
      profile_image: '🌟',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 30
    },
    {
      title: 'Just uploaded my first video! 🎬',
      description: 'New to the platform! Excited to join this amazing community. Show some love! $NEWBIE',
      video_url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4',
      username: 'fresh_start',
      creator_token: 'NEWBIE',
      profile_image: '🎬',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 1
    },
    {
      title: 'Testing out this new social token feature 🧪',
      description: 'Just launched my token. Let me know what you think! Early supporters appreciated. $TEST',
      video_url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.mp4',
      username: 'test_pilot',
      creator_token: 'TEST',
      profile_image: '🧪',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 0.5
    },
    {
      title: 'GM to all my token holders ☀️',
      description: 'Another day, another pump! Who else is feeling bullish today? Let\'s make it happen! $RISE',
      video_url: 'https://media.giphy.com/media/g9582DNuQppxC/giphy.mp4',
      username: 'sunrise_crypto',
      creator_token: 'RISE',
      profile_image: '☀️',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 5
    },
    {
      title: 'How it feels holding diamond hands 💎🙌',
      description: 'Not selling, not trading, just HODLING. True believers only in this community! $DIAMOND',
      video_url: 'https://media.giphy.com/media/6ra84Uso2hoir3YCgb/giphy.mp4',
      username: 'diamond_hodler',
      creator_token: 'DIAMOND',
      profile_image: '💎',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 7
    },
    {
      title: 'Just hit 1000 followers! 🎉 Thank you all!',
      description: 'Couldn\'t have done it without this amazing community. Airdrop coming soon for OG holders! $GROW',
      video_url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.mp4',
      username: 'growth_mindset',
      creator_token: 'GROW',
      profile_image: '🎉',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 9
    },
    {
      title: 'NFT drop + Token launch = Ultimate combo 🎨',
      description: 'Bridging the gap between art and finance. My NFT holders get 50% off token presale! $ART',
      video_url: 'https://media.giphy.com/media/3oEjHWPTo7c0ajPwty/giphy.mp4',
      username: 'crypto_artist',
      creator_token: 'ART',
      profile_image: '🎨',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 11
    },
    {
      title: 'Bonding curve mathematics explained simply 📊',
      description: 'It\'s not as complicated as you think! Let me break it down for you. $MATH',
      video_url: 'https://media.giphy.com/media/3o6Zt3LdsGts11udSU/giphy.mp4',
      username: 'defi_professor',
      creator_token: 'MATH',
      profile_image: '📊',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 13
    },
    {
      title: 'DAO governance vote results are in! 🗳️',
      description: 'Community has spoken! Proposal passed with 89% approval. This is true decentralization! $VOTE',
      video_url: 'https://media.giphy.com/media/l0HlBO7eyXzSZkSDK/giphy.mp4',
      username: 'dao_builder',
      creator_token: 'VOTE',
      profile_image: '🗳️',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 15
    },
    {
      title: 'When gas fees are finally reasonable 💸',
      description: 'Finally can make transactions without selling a kidney! Layer 2 solutions are amazing! $GAS',
      video_url: 'https://media.giphy.com/media/DffShiJ47fPqM/giphy.mp4',
      username: 'gas_saver',
      creator_token: 'GAS',
      profile_image: '💸',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 17
    },
    {
      title: 'Collaborating with 5 other creators! 🤝',
      description: 'Power in numbers! We\'re launching a cross-token rewards program. Stay tuned! $COLLAB',
      video_url: 'https://media.giphy.com/media/l0IylSajlbPRFxH8Y/giphy.mp4',
      username: 'collab_queen',
      creator_token: 'COLLAB',
      profile_image: '🤝',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 19
    },
    {
      title: 'Passive income through social tokens is REAL 💵',
      description: 'Made $500 this week just from my community! This is the future of creator economy! $PASSIVE',
      video_url: 'https://media.giphy.com/media/67ThRZlYBvibtdF9JH/giphy.mp4',
      username: 'passive_income',
      creator_token: 'PASSIVE',
      profile_image: '💵',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 21
    },
    {
      title: 'Web3 changed my life 🌐',
      description: 'From broke to thriving in 6 months. All thanks to tokenized communities and amazing people! $WEB3',
      video_url: 'https://media.giphy.com/media/3o7qDSOvfaCO9b3MlO/giphy.mp4',
      username: 'web3_warrior',
      creator_token: 'WEB3',
      profile_image: '🌐',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 23
    },
    {
      title: 'Staking rewards just hit my wallet 🔐',
      description: 'Love waking up to passive gains! Who else is staking their creator tokens? $STAKE',
      video_url: 'https://media.giphy.com/media/3o6Zt6KHxJxck20FeM/giphy.mp4',
      username: 'stake_master',
      creator_token: 'STAKE',
      profile_image: '🔐',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 25
    },
    {
      title: 'My mom finally understands crypto! 👩',
      description: 'Explained social tokens to her and now she wants to launch her own! Adoption is coming! $MOM',
      video_url: 'https://media.giphy.com/media/26uf4r3EldfX5Ykqk/giphy.mp4',
      username: 'crypto_family',
      creator_token: 'MOM',
      profile_image: '👩',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 27
    },
    {
      title: 'Token utility announcement coming tomorrow! 🚀',
      description: 'Been working on something BIG. Token holders, you\'re going to love this! $UTIL',
      video_url: 'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.mp4',
      username: 'utility_king',
      creator_token: 'UTIL',
      profile_image: '🛠️',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 29
    },
    {
      title: 'Feeling grateful for this community ❤️',
      description: 'You all believed in me from day 1. Now look at us! Thank you for the love and support! $LOVE',
      video_url: 'https://media.giphy.com/media/ZBQhoZC0nqknSviPqT/giphy.mp4',
      username: 'grateful_creator',
      creator_token: 'LOVE',
      profile_image: '❤️',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      hoursAgo: 31
    }
  ]

  demoVideos.forEach((video, index) => {
    videos.push({
      id: String(videoIdCounter++),
      creator_id: `demo-creator-${index}`,
      title: video.title,
      description: video.description,
      video_url: video.video_url,
      thumbnail_url: null,
      duration: Math.floor(Math.random() * 10) + 3,
      category: video.creator_token,
      views_count: video.views_count,
      likes_count: video.likes_count,
      comments_count: video.comments_count,
      is_published: true,
      created_at: new Date(Date.now() - video.hoursAgo * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - video.hoursAgo * 60 * 60 * 1000).toISOString(),
      username: video.username,
      creator_token: video.creator_token,
      profile_image_url: video.profile_image
    })
  })
}

// Initialize demo content on module load
initDemoContent()

// Track user likes (in-memory)
const userLikes = new Map() // Map<userId, Set<videoId>>

class VideoMemory {
  // Create a new video
  static async create({ creatorId, title, description, videoUrl, thumbnailUrl, duration, category }) {
    const video = {
      id: String(videoIdCounter++),
      creator_id: creatorId,
      title,
      description: description || '',
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      duration,
      category: category || 'general',
      views_count: 0,
      likes_count: 0,
      comments_count: 0,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Mock creator info
      username: 'user' + creatorId.substring(0, 4),
      creator_token: category.toUpperCase(),
      profile_image_url: null
    }

    videos.push(video)
    return video
  }

  // Get all videos (for feed)
  static async getAll(limit = 50, offset = 0) {
    const sorted = [...videos].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    return sorted.slice(offset, offset + limit)
  }

  // Get videos by creator
  static async getByCreator(creatorId, limit = 50, offset = 0) {
    const filtered = videos.filter(v => v.creator_id === creatorId)
    const sorted = filtered.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    return sorted.slice(offset, offset + limit)
  }

  // Get video by ID
  static async getById(videoId) {
    return videos.find(v => v.id === videoId)
  }

  // Increment view count
  static async incrementViews(videoId) {
    const video = videos.find(v => v.id === videoId)
    if (video) {
      video.views_count++
    }
  }

  // Like a video
  static async like(videoId, userId) {
    const video = videos.find(v => v.id === videoId)
    if (!video) return { liked: false }

    // Get user's liked videos
    if (!userLikes.has(userId)) {
      userLikes.set(userId, new Set())
    }

    const likedVideos = userLikes.get(userId)

    // Toggle like
    if (likedVideos.has(videoId)) {
      // Unlike
      likedVideos.delete(videoId)
      video.likes_count = Math.max(0, video.likes_count - 1)
      return { liked: false }
    } else {
      // Like
      likedVideos.add(videoId)
      video.likes_count++
      return { liked: true }
    }
  }

  // Delete video
  static async delete(videoId, userId) {
    const index = videos.findIndex(v => v.id === videoId && v.creator_id === userId)
    if (index !== -1) {
      const deleted = videos.splice(index, 1)[0]
      return deleted
    }
    return null
  }
}

module.exports = VideoMemory
