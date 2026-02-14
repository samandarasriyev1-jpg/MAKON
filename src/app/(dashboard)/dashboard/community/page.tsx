"use client";

import { useState } from "react";
import {
    MessageSquare,
    Heart,
    Share2,
    MoreHorizontal,
    Search,
    Pin,
    Image as ImageIcon,
    Paperclip,
    Send,
    Check
} from "lucide-react";

// Mock Data for Community Feed
const INITIAL_POSTS = [
    {
        id: 1,
        user: {
            name: "Aziz Rakhimov",
            avatar: "blue",
            role: "O'qituvchi",
            level: 5
        },
        content: "MAKON platformasida yangi Frontend kursi bo'yicha savollaringiz bormi? 🔥\n\nBugun kechki payt jonli efirda barcha savollarga javob beramiz. Kimlar qatnashadi?",
        likes: 24,
        comments: 12,
        time: "2 soat oldin",
        isPinned: true,
        tags: ["E'lonlar", "Frontend"],
        likedByMe: false,
        commentsList: [
            { id: 101, user: { name: "O'quvchi 1", avatar: "green" }, content: "Men qatnashaman!", time: "1 soat oldin" },
            { id: 102, user: { name: "O'quvchi 2", avatar: "purple" }, content: "Sofft soat nechida?", time: "30 daqiqa oldin" }
        ]
    },
    {
        id: 2,
        user: {
            name: "Malika Karimova",
            avatar: "purple",
            role: "O'quvchi",
            level: 2
        },
        content: "React.js darslarini tugatdim! 🚀\n\nJuda qiziqarli bo'ldi, ayniqsa Hooks mavzusi. Endi o'z loyihamni boshlayapman. Kim men bilan birga o'rganishni xohlaydi?",
        likes: 15,
        comments: 5,
        time: "5 soat oldin",
        isPinned: false,
        tags: ["Yutuqlar", "Networking"],
        likedByMe: false,
        commentsList: []
    },
    {
        id: 3,
        user: {
            name: "Jamshid Aliyev",
            avatar: "green",
            role: "O'quvchi",
            level: 1
        },
        content: "Salom hammaga! 3-moduldagi vazifani bajarishda kim yordam bera oladi? API ulanishda xatolik beryapti.",
        likes: 3,
        comments: 8,
        time: "1 kun oldin",
        isPinned: false,
        tags: ["Yordam", "Javascript"],
        likedByMe: false,
        commentsList: []
    }
];

const CATEGORIES = [
    { name: "Barchasi", count: 124 },
    { name: "E'lonlar", count: 12 },
    { name: "Umumiy Chat", count: 45 },
    { name: "Yordam", count: 18 },
    { name: "Yutuqlar", count: 32 },
    { name: "Meme", count: 17 },
];

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState("Barchasi");
    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [newPostContent, setNewPostContent] = useState("");
    const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
    const [newComment, setNewComment] = useState("");
    const [copiedPostId, setCopiedPostId] = useState<number | null>(null);

    // Current User Mock
    const currentUser = {
        name: "Siz (Demo)",
        avatar: "blue",
        role: "O'quvchi",
        level: 1
    };

    const handlePost = () => {
        if (!newPostContent.trim()) return;

        const newPost = {
            id: Date.now(),
            user: currentUser,
            content: newPostContent,
            likes: 0,
            comments: 0,
            time: "Hozirgina",
            isPinned: false,
            tags: ["General"],
            likedByMe: false,
            commentsList: []
        };

        setPosts([newPost, ...posts]);
        setNewPostContent("");
    };

    const handleLike = (postId: number) => {
        setPosts(posts.map(post => {
            if (post.id === postId) {
                const isLiked = post.likedByMe;
                return {
                    ...post,
                    likes: isLiked ? post.likes - 1 : post.likes + 1,
                    likedByMe: !isLiked
                };
            }
            return post;
        }));
    };

    const handleComment = (postId: number) => {
        if (!newComment.trim()) return;

        setPosts(posts.map(post => {
            if (post.id === postId) {
                return {
                    ...post,
                    comments: post.comments + 1,
                    commentsList: [
                        ...post.commentsList,
                        { id: Date.now(), user: currentUser, content: newComment, time: "Hozirgina" }
                    ]
                };
            }
            return post;
        }));
        setNewComment("");
    };

    const handleShare = (postId: number) => {
        // Mock share - copy logic
        setCopiedPostId(postId);
        setTimeout(() => setCopiedPostId(null), 2000);
    };

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-6 overflow-hidden">
            {/* Main Feed Area */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-20 no-scrollbar">

                {/* Search & Filter */}
                <div className="flex items-center justify-between sticky top-0 bg-[#0A192F]/95 backdrop-blur-md z-10 py-2">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Hamjamiyat bo'ylab qidirish..."
                            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                </div>

                {/* Create Post Input */}
                <div className="glass-card p-4 rounded-2xl flex gap-4 items-start">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Nimani o'ylayapsiz?..."
                            className="w-full bg-transparent border-none text-white placeholder:text-muted-foreground/50 focus:ring-0 text-lg mb-2 resize-none h-auto min-h-[60px]"
                        />
                        <div className="flex items-center justify-between border-t border-white/5 pt-3">
                            <div className="flex gap-2 text-muted-foreground">
                                <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <ImageIcon className="h-5 w-5" />
                                </button>
                                <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <Paperclip className="h-5 w-5" />
                                </button>
                            </div>
                            <button
                                onClick={handlePost}
                                disabled={!newPostContent.trim()}
                                className="bg-primary hover:bg-primary/90 text-[#0A192F] px-4 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="h-4 w-4" />
                                Joylash
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feed */}
                <div className="space-y-4">
                    {posts.map((post) => (
                        <div key={post.id} className="glass-card p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {post.isPinned && (
                                <div className="flex items-center gap-2 text-xs font-bold text-primary mb-3 uppercase tracking-wider">
                                    <Pin className="h-3 w-3 fill-current" />
                                    Mahkamlangan
                                </div>
                            )}

                            <div className="flex items-start gap-3 mb-4">
                                <div className={`h-10 w-10 rounded-full flex-shrink-0 bg-gradient-to-tr ${post.user.avatar === 'blue' ? 'from-blue-500 to-cyan-400' :
                                        post.user.avatar === 'purple' ? 'from-purple-500 to-pink-400' :
                                            'from-green-500 to-emerald-400'
                                    }`} />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-white text-sm md:text-base">{post.user.name}</h3>
                                        {post.user.role === "O'qituvchi" && (
                                            <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">Admin</span>
                                        )}
                                        <span className="text-muted-foreground text-xs">• {post.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>Level {post.user.level}</span>
                                        {post.tags.map(tag => (
                                            <span key={tag} className="bg-white/5 px-2 py-0.5 rounded text-[10px] text-white/70">#{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <button className="ml-auto text-muted-foreground hover:text-white">
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="text-white/90 whitespace-pre-wrap mb-4 text-sm md:text-base leading-relaxed">
                                {post.content}
                            </div>

                            <div className="flex items-center gap-6 border-t border-white/5 pt-4">
                                <button
                                    onClick={() => handleLike(post.id)}
                                    className={`flex items-center gap-2 transition-colors group ${post.likedByMe ? "text-red-500" : "text-muted-foreground hover:text-red-400"
                                        }`}
                                >
                                    <Heart className={`h-5 w-5 ${post.likedByMe ? "fill-current" : "group-hover:fill-current"}`} />
                                    <span className="text-sm font-medium">{post.likes}</span>
                                </button>
                                <button
                                    onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                                    className={`flex items-center gap-2 transition-colors ${expandedPostId === post.id ? "text-primary" : "text-muted-foreground hover:text-primary"
                                        }`}
                                >
                                    <MessageSquare className="h-5 w-5" />
                                    <span className="text-sm font-medium">{post.comments}</span>
                                </button>
                                <button
                                    onClick={() => handleShare(post.id)}
                                    className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors ml-auto"
                                >
                                    {copiedPostId === post.id ? (
                                        <>
                                            <Check className="h-5 w-5 text-green-400" />
                                            <span className="text-sm font-medium text-green-400 hidden sm:inline">Nusxalandi</span>
                                        </>
                                    ) : (
                                        <>
                                            <Share2 className="h-5 w-5" />
                                            <span className="text-sm font-medium hidden sm:inline">Ulashish</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Comments Section */}
                            {expandedPostId === post.id && (
                                <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    {/* Existing Comments */}
                                    {post.commentsList.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex-shrink-0" />
                                            <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-none p-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-bold text-white">{comment.user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{comment.time}</span>
                                                </div>
                                                <p className="text-sm text-white/80">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add Comment */}
                                    <div className="flex gap-3 items-center">
                                        <div className="h-8 w-8 rounded-full bg-primary flex-shrink-0" />
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                            placeholder="Izoh yozing..."
                                            className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-primary transition-all"
                                        />
                                        <button
                                            onClick={() => handleComment(post.id)}
                                            disabled={!newComment.trim()}
                                            className="p-2 bg-white/5 hover:bg-primary/20 text-muted-foreground hover:text-primary rounded-xl transition-colors disabled:opacity-50"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Sidebar (Categories & Info) - Hidden on mobile */}
            <div className="hidden lg:flex w-72 flex-col gap-6 overflow-y-auto no-scrollbar pb-20">

                {/* About Community */}
                <div className="glass-card p-5 rounded-2xl">
                    <h3 className="font-bold text-white mb-2">MAKON Hamjamiyati</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                        Bu yerda siz savol berishingiz, tajriba almashishingiz va boshqa o'quvchilar bilan tanishishingiz mumkin.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span>142 online</span>
                    </div>
                </div>

                {/* Categories */}
                <div className="glass-card p-3 rounded-2xl">
                    <h4 className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Kategoriyalar</h4>
                    <div className="space-y-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.name}
                                onClick={() => setActiveTab(cat.name)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === cat.name
                                        ? "bg-primary/20 text-primary"
                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <span>{cat.name}</span>
                                <span className="text-xs opacity-50">{cat.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rules / Guidelines */}
                <div className="p-4 rounded-2xl border border-white/5 bg-black/20">
                    <h4 className="font-bold text-white text-sm mb-3">Qoidalar</h4>
                    <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4">
                        <li>Hurmatli bo'ling</li>
                        <li>Spam tarqatmang</li>
                        <li>Mavzuga doir yozing</li>
                    </ul>
                </div>

            </div>
        </div>
    );
}
