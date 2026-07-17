import { useState } from "react";
import { Link } from "wouter";
import { useListNews } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function News() {
  const [category, setCategory] = useState<string>("all");
  const { data: news, isLoading } = useListNews(category !== "all" ? { category } : undefined);

  const categories = [
    { id: "all", label: "All News" },
    { id: "tournament", label: "Tournaments" },
    { id: "gaming", label: "Gaming" },
    { id: "recap", label: "Recaps" },
    { id: "announcement", label: "Announcements" }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight mb-4">
          Latest News
        </h1>
        <p className="text-muted-foreground text-lg">Updates, patch notes, and tournament recaps.</p>
      </div>

      <Tabs value={category} onValueChange={setCategory} className="mb-8">
        <TabsList className="bg-card border border-white/5 h-auto flex-wrap justify-start p-1">
          {categories.map(c => (
            <TabsTrigger key={c.id} value={c.id} className="font-display uppercase tracking-wider text-xs px-4 py-2">
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[400px] rounded-xl bg-card/30 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news?.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/news/${post.id}`}>
                <Card className="glass-card glass-card-hover h-full flex flex-col overflow-hidden group cursor-pointer border-white/5">
                  <div className="h-48 w-full overflow-hidden relative bg-muted/20">
                    {post.coverUrl && (
                      <img 
                        src={post.coverUrl} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-primary hover:bg-primary uppercase tracking-widest text-[10px]">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center text-xs text-muted-foreground mb-3 font-mono">
                      <Calendar className="w-3 h-3 mr-2" />
                      {new Date(post.publishedAt).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      {post.author}
                    </div>
                    
                    <h3 className="text-xl font-display font-bold uppercase leading-tight mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center text-primary text-sm font-bold uppercase tracking-wider">
                      Read More <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
          {news?.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No articles found in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
