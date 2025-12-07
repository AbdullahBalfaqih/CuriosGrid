"use client";

import { useEffect } from 'react';
import { useUser, type Draft } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { CurioGridLogo } from '@/components/trend-pulse-logo';
import { Button } from '@/components/ui/button';
import { User, FileText, Copy, Trash2, Image as ImageIcon, Video, Bot } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const DRAFT_ICONS = {
  post: FileText,
  image: ImageIcon,
  script: Video,
  bot: Bot,
};

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" className="fill-current">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
  </svg>
);


const RedditIcon = () => (
    <img src="https://www.redditstatic.com/favicon.ico" alt="Reddit" width="14" height="14" />
);


const DraftCard = ({ draft, onDelete, onCopy, onShare }: { draft: Draft, onDelete: (id: string) => void, onCopy: (content: any) => void, onShare: (platform: 'twitter' | 'reddit', draft: Draft) => void }) => {
    const Icon = DRAFT_ICONS[draft.type] || FileText;

    const renderContentPreview = () => {
        if (typeof draft.content === 'string') {
            return <p className="text-sm text-neutral-400 line-clamp-2">{draft.content}</p>;
        }
        if (draft.type === 'image' && typeof draft.content === 'object' && draft.content.prompt) {
            return <p className="text-sm text-neutral-400 line-clamp-2 italic">{draft.content.prompt}</p>
        }
        if (draft.type === 'post' && typeof draft.content === 'object' && draft.content.post) {
            return <p className="text-sm text-neutral-400 line-clamp-2">{draft.content.post}</p>;
        }
        return <pre className="text-xs text-neutral-500 line-clamp-2 bg-neutral-900 p-2 rounded-md font-code"><code>{JSON.stringify(draft.content)}</code></pre>;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            className="bg-card border border-border rounded-3xl p-6 flex flex-col gap-4"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Icon size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white capitalize">{draft.type} Draft</h3>
                        <p className="text-xs text-neutral-500">Saved {draft.createdAt ? formatDistanceToNow(new Date(draft.createdAt), { addSuffix: true }) : 'just now'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-neutral-400 hover:text-white" onClick={() => onShare('twitter', draft)}>
                        <XIcon />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-neutral-400 hover:text-white" onClick={() => onShare('reddit', draft)}>
                        <RedditIcon />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-neutral-400 hover:text-white" onClick={() => onCopy(draft.content)}>
                        <Copy size={16} />
                    </Button>
                     <Button variant="ghost" size="icon" className="w-8 h-8 text-red-500 hover:bg-red-500/10" onClick={() => onDelete(draft.id)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
            <div>
                <p className="text-sm text-neutral-400 mb-2">Original Topic: <span className="font-semibold text-neutral-300">{draft.topic}</span></p>
                {renderContentPreview()}
            </div>
        </motion.div>
    );
};

export default function DraftsPage() {
  const { user, isLoggedIn, deleteDraft } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isLoggedIn === false) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn || !user) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleDelete = (id: string) => {
    deleteDraft(id);
    toast({
        title: "Draft Deleted",
        description: "The draft has been removed."
    });
  }

  const handleCopy = (content: any) => {
    let textToCopy = "";
    if (typeof content === 'string') {
        textToCopy = content;
    } else if (content && typeof content === 'object' && content.post) {
      textToCopy = content.post;
    } else {
        textToCopy = JSON.stringify(content, null, 2);
    }
    navigator.clipboard.writeText(textToCopy).then(() => {
        toast({ title: "Copied to clipboard!" });
    });
  }

  const handleShare = (platform: 'twitter' | 'reddit', draft: Draft) => {
    let shareUrl = '';
    let textContent = '';
    let urlContent = '';
  
    if (typeof draft.content === 'string') {
      textContent = draft.content;
    } else if (draft.type === 'image' && draft.content && typeof draft.content === 'object' && 'prompt' in draft.content && 'url' in draft.content) {
      textContent = draft.content.prompt;
      urlContent = draft.content.url;
    } else if (draft.content && typeof draft.content === 'object' && 'post' in draft.content) {
      textContent = draft.content.post;
    }
    else {
        textContent = JSON.stringify(draft.content, null, 2);
    }
  
    const fullText = (draft.type === 'image' ? `Image Prompt: ${textContent}\n\n${urlContent}` : textContent) + `\n\n#CurioGridAI`;
  
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
    } else if (platform === 'reddit') {
      shareUrl = `https://www.reddit.com/submit?title=${encodeURIComponent(draft.topic)}&text=${encodeURIComponent(fullText)}`;
    }
  
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body flex flex-col">
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Link href="/">
                <CurioGridLogo />
              </Link>
              <span className="hidden sm:inline text-2xl font-bold tracking-tight">CurioGrid</span>
           </div>
           <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                        <User size={20} />
                    </Button>
                </Link>
           </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
         <div className="flex items-center justify-between mb-12">
            <h1 className="text-5xl font-bold text-white">My Drafts</h1>
            <p className="text-lg text-neutral-400">{user.drafts.length} item(s)</p>
         </div>

         {user.drafts.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-border rounded-3xl flex flex-col items-center">
                <FileText size={48} className="text-neutral-700 mb-4" />
                <h2 className="text-2xl font-bold text-neutral-500 mb-2">No Drafts Yet</h2>
                <p className="text-neutral-600">Your saved drafts will appear here.</p>
            </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {user.drafts.map(draft => (
                        <DraftCard key={draft.id} draft={draft} onDelete={handleDelete} onCopy={handleCopy} onShare={handleShare} />
                    ))}
                </AnimatePresence>
             </div>
         )}
      </main>
    </div>
  );
}
