import type { BlogPost } from "@/components/blog-card"

export const mockPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Future of AI in Web Development: What Developers Need to Know",
    excerpt:
      "Explore how artificial intelligence is revolutionizing the way we build and maintain web applications, from code generation to automated testing.",
    author: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    coverImage:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop",
    category: "Technology",
    readTime: "8 min read",
    likes: 234,
    comments: 45,
    createdAt: "Mar 15, 2024",
    isLiked: false,
    isBookmarked: true,
  },
  {
    id: "2",
    title: "Mastering Minimalist Design: Less is More",
    excerpt:
      "Learn the principles of minimalist design and how to create stunning, clean interfaces that captivate users and improve usability.",
    author: {
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    coverImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=500&fit=crop",
    category: "Design",
    readTime: "6 min read",
    likes: 189,
    comments: 32,
    createdAt: "Mar 14, 2024",
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: "3",
    title: "Building Scalable APIs with Next.js Server Actions",
    excerpt:
      "A comprehensive guide to leveraging Next.js Server Actions for building robust, type-safe APIs that scale with your application.",
    author: {
      name: "Emily Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop",
    category: "Development",
    readTime: "12 min read",
    likes: 312,
    comments: 67,
    createdAt: "Mar 13, 2024",
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "4",
    title: "The Art of Productive Morning Routines",
    excerpt:
      "Discover how successful entrepreneurs structure their mornings for maximum productivity and mental clarity throughout the day.",
    author: {
      name: "David Park",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    coverImage:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=500&fit=crop",
    category: "Lifestyle",
    readTime: "5 min read",
    likes: 156,
    comments: 28,
    createdAt: "Mar 12, 2024",
    isLiked: false,
    isBookmarked: true,
  },
  {
    id: "5",
    title: "Understanding TypeScript Generics: A Practical Guide",
    excerpt:
      "Demystify TypeScript generics with real-world examples and learn how to write more flexible, reusable code.",
    author: {
      name: "Alex Thompson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    coverImage:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=500&fit=crop",
    category: "Development",
    readTime: "10 min read",
    likes: 278,
    comments: 54,
    createdAt: "Mar 11, 2024",
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: "6",
    title: "Remote Work Culture: Building Strong Teams Across Time Zones",
    excerpt:
      "Strategies for fostering collaboration and maintaining company culture when your team is distributed around the globe.",
    author: {
      name: "Lisa Wang",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    },
    coverImage:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=500&fit=crop",
    category: "Business",
    readTime: "7 min read",
    likes: 198,
    comments: 41,
    createdAt: "Mar 10, 2024",
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: "7",
    title: "Exploring Hidden Gems in Southeast Asia",
    excerpt:
      "Venture off the beaten path and discover the most breathtaking, lesser-known destinations across Southeast Asia.",
    author: {
      name: "James Miller",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
    },
    coverImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=500&fit=crop",
    category: "Travel",
    readTime: "9 min read",
    likes: 267,
    comments: 38,
    createdAt: "Mar 9, 2024",
    isLiked: true,
    isBookmarked: true,
  },
  {
    id: "8",
    title: "Color Theory for Digital Designers",
    excerpt:
      "Master the fundamentals of color theory and learn how to create harmonious, accessible color palettes for your designs.",
    author: {
      name: "Nina Foster",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
    },
    coverImage:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=500&fit=crop",
    category: "Design",
    readTime: "8 min read",
    likes: 223,
    comments: 49,
    createdAt: "Mar 8, 2024",
    isLiked: false,
    isBookmarked: false,
  },
]
