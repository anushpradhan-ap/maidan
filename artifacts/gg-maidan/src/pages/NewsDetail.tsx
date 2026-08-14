import { useRoute, Link } from "wouter";
import { useGetNewsPost } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowLeft, Tag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewsDetail() {
  const [, params] = useRoute("/news/:id");
  const id = Number(params?.id);

  const { data: post, isLoading } = useGetNewsPost(id, {
    query: { queryKey: ["/api/news", id], enabled: !!id }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading article…</p>
      </div>
    );
  }
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">📭</p>
        <p className="text-muted-foreground text-lg">Article not found.</p>
        <Link href="/"><Button variant="ghost" className="mt-4"><ArrowLeft className="w-4 h-4 mr-2" /> Back to News</Button></Link>
      </div>
    );
  }

  return (
    <article className="pb-20">
      {/* Hero */}
      <div className="relative min-h-[45vh] w-full">
        {post.coverUrl ? (
          <img src={post.coverUrl} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-card" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end min-h-[45vh] p-6 md:p-12">
          <div className="container mx-auto max-w-4xl">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-6 text-white/60 hover:text-white -ml-3 backdrop-blur-sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to News
              </Button>
            </Link>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-primary uppercase tracking-widest text-xs">{post.category}</Badge>
              {(post as any).isBreaking && (
                <Badge className="bg-red-600 text-white uppercase tracking-widest text-xs flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Breaking
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black uppercase tracking-tight text-white mb-5 leading-tight drop-shadow-lg">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-5 text-sm text-gray-300 font-mono">
              <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary" />{post.author}</span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-secondary" />
                {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {post.excerpt && (
          <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-primary pl-5 mb-8 italic">
            {post.excerpt}
          </p>
        )}

        <div
          className="prose prose-invert prose-lg max-w-none text-gray-300
            prose-headings:font-display prose-headings:uppercase prose-headings:font-bold prose-headings:text-white prose-headings:tracking-tight
            prose-a:text-primary hover:prose-a:text-primary/80
            prose-strong:text-white
            prose-img:rounded-xl prose-img:border prose-img:border-white/10
            prose-blockquote:border-primary prose-blockquote:text-muted-foreground
            whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-2 items-center">
            <Tag className="w-4 h-4 text-muted-foreground mr-1 shrink-0" />
            {post.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground text-xs font-mono border border-white/10 transition-colors cursor-default">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-white/10">
          <Link href="/">
            <Button variant="outline" className="border-white/10 hover:bg-white/5">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to News
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
