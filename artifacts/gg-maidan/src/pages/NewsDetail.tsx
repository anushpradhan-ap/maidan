import { useRoute, Link } from "wouter";
import { useGetNewsPost } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewsDetail() {
  const [, params] = useRoute("/news/:id");
  const id = Number(params?.id);

  const { data: post, isLoading } = useGetNewsPost(id, {
    query: { enabled: !!id, queryKey: ['/api/news', id] }
  });

  if (isLoading) return <div className="container py-20 text-center animate-pulse">Loading article...</div>;
  if (!post) return <div className="container py-20 text-center">Article not found</div>;

  return (
    <article className="pb-20">
      {/* Header / Hero */}
      <div className="relative h-[40vh] md:h-[60vh] w-full bg-card">
        {post.coverUrl ? (
          <img src={post.coverUrl} alt={post.title} className="w-full h-full object-cover opacity-40" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-card" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="container mx-auto max-w-4xl">
            <Link href="/news">
              <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-white -ml-3">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to News
              </Button>
            </Link>
            
            <Badge className="bg-primary uppercase tracking-widest mb-4">
              {post.category}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tight text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 font-mono">
              <span className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {post.author}</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-secondary" /> {new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-invert prose-lg md:prose-xl max-w-none text-gray-300 font-sans leading-relaxed
          prose-headings:font-display prose-headings:uppercase prose-headings:font-bold prose-headings:text-white
          prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl prose-img:border prose-img:border-white/10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-2 items-center">
            <Tag className="w-4 h-4 text-muted-foreground mr-2" />
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-white/5 hover:bg-white/10 text-muted-foreground font-mono">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
