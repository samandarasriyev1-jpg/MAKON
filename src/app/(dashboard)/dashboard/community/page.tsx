"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import { Loader2, MessageSquare, ThumbsUp, Send, User } from "lucide-react";
import { EventsCalendar } from "@/components/community/EventsCalendar";

interface Post {
    id: string;
    title: string | null;
    content: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
    user_has_liked?: boolean;
}

export const dynamic = "force-dynamic";

export default function CommunityPage() {
    const { user, isLoading: authLoading } = useAuth();
    const supabase = createClient();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("community_posts")
                .select(`
                    id, title, content, likes_count, comments_count, created_at,
                    profiles(full_name, avatar_url)
                `)
                .order("created_at", { ascending: false });

            if (data && user) {
                // Check which posts the user has liked
                const postIds = data.map(p => p.id);
                const { data: likesData } = await supabase
                    .from("post_likes")
                    .select("post_id")
                    .eq("user_id", user.id)
                    .in("post_id", postIds);

                const likedSet = new Set(likesData?.map(l => l.post_id) || []);
                const postsWithLikes = data.map((post: any) => ({
                    ...post,
                    user_has_liked: likedSet.has(post.id)
                }));
                setPosts(postsWithLikes);
            } else if (data) {
                setPosts(data as any);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [supabase, user]);

    useEffect(() => {
        if (authLoading) return;
        fetchPosts();
    }, [authLoading, fetchPosts]);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim() || !user) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from("community_posts")
                .insert({
                    author_id: user.id,
                    content: newPostContent,
                });

            if (!error) {
                setNewPostContent("");
                fetchPosts(); // Refresh list
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = async (postId: string, currentlyLiked: boolean, currentCount: number) => {
        if (!user) return;

        // Optimistic UI update
        setPosts(posts.map(post =>
            post.id === postId
                ? { ...post, user_has_liked: !currentlyLiked, likes_count: currentlyLiked ? currentCount - 1 : currentCount + 1 }
                : post
        ));

        try {
            if (currentlyLiked) {
                await supabase.from("post_likes").delete().match({ post_id: postId, user_id: user.id });
                await supabase.rpc('decrement_post_likes', { p_post_id: postId }); // Assuming RPC exists or managed another way
                // Fallback direct update since we don't know if RPC exists:
                await supabase.from("community_posts").update({ likes_count: currentCount - 1 }).eq("id", postId);
            } else {
                await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
                await supabase.from("community_posts").update({ likes_count: currentCount + 1 }).eq("id", postId);
            }
        } catch (err) {
            console.error(err);
            // Revert on error
            fetchPosts();
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white glow-text">Hamjamiyat</h1>
                <p className="text-muted-foreground mt-2">Boshqa o&apos;quvchilar bilan tajriba almashing va savol bering.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Create Post */}
                    <div className="glass-card p-6 rounded-3xl">
                        <form onSubmit={handleCreatePost}>
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="Yangi mavzu qidiring yoki o'rtoqlashing..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-primary min-h-[120px] resize-none"
                            />
                            <div className="flex justify-end mt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newPostContent.trim()}
                                    className="bg-primary text-[#0A192F] px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                    Ulashish
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Posts List */}
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <div key={post.id} className="glass-card p-6 rounded-3xl hover:bg-white/5 transition-colors group cursor-pointer">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-purple-500 overflow-hidden shrink-0 flex items-center justify-center">
                                        {post.profiles?.avatar_url ? (
                                            <img src={post.profiles.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="h-6 w-6 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-white">{post.profiles?.full_name || "O'quvchi"}</h4>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(post.created_at).toLocaleDateString("uz-UZ", {
                                                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                                        <div className="flex items-center gap-6 mt-4">
                                            <button
                                                onClick={() => handleLike(post.id, !!post.user_has_liked, post.likes_count)}
                                                className={`flex items-center gap-2 transition-colors text-sm font-medium ${post.user_has_liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                                            >
                                                <ThumbsUp className={`h-4 w-4 ${post.user_has_liked ? 'fill-primary' : ''}`} />
                                                {post.likes_count} Likes
                                            </button>
                                            <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-400 transition-colors text-sm font-medium">
                                                <MessageSquare className="h-4 w-4" />
                                                {post.comments_count} Kammentlar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {posts.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground glass-card rounded-3xl">
                                Hozircha hech qanday post yo&apos;q. Birinchi bo&apos;lib yozing!
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <EventsCalendar />
                </div>
            </div>
        </div>
    );
}
