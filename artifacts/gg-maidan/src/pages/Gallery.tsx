import { useState } from "react";
import { useListGallery } from "@workspace/api-client-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function Gallery() {
  const [type, setType] = useState<"all" | "photo" | "video" | "highlight">("all");
  const { data: gallery, isLoading } = useListGallery(type !== "all" ? { type } : undefined);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight mb-4 text-white">
          Media Gallery
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Highlights, moments, and memories from the Maidan.
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <Tabs value={type} onValueChange={(v) => setType(v as any)}>
          <TabsList className="bg-card border border-white/5">
            <TabsTrigger value="all" className="font-display uppercase tracking-wider text-xs px-6">All</TabsTrigger>
            <TabsTrigger value="photo" className="font-display uppercase tracking-wider text-xs px-6">Photos</TabsTrigger>
            <TabsTrigger value="video" className="font-display uppercase tracking-wider text-xs px-6">Videos</TabsTrigger>
            <TabsTrigger value="highlight" className="font-display uppercase tracking-wider text-xs px-6">Highlights</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-square rounded-xl bg-card/30 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery?.map((item, i) => (
            <Dialog key={item.id}>
              <DialogTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-square relative rounded-xl overflow-hidden group cursor-pointer border border-white/5 bg-card/50"
                >
                  <img 
                    src={item.thumbnailUrl || item.url} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute bottom-0 left-0 w-full p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white font-bold text-sm line-clamp-1">{item.title}</p>
                    {item.tournamentName && <p className="text-xs text-primary">{item.tournamentName}</p>}
                  </div>

                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur p-2 rounded-full">
                    {item.type === 'photo' ? <ImageIcon className="w-4 h-4 text-white" /> : <PlayCircle className="w-4 h-4 text-white" />}
                  </div>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-5xl bg-black/90 border-white/10 p-0 overflow-hidden">
                {item.type === 'photo' ? (
                  <img src={item.url} alt={item.title} className="w-full h-auto max-h-[80vh] object-contain" />
                ) : (
                  <div className="aspect-video w-full">
                    <iframe src={item.url} className="w-full h-full" allowFullScreen />
                  </div>
                )}
                <div className="p-4 bg-black/50 absolute bottom-0 left-0 w-full">
                  <h3 className="font-display uppercase font-bold text-white">{item.title}</h3>
                </div>
              </DialogContent>
            </Dialog>
          ))}
          {gallery?.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No media found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
