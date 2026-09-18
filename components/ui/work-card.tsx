import Link from "next/link";

interface WorkCardProps {
  id: string;
  title: string;
  author: string;
  category: string;
  href: string;
  coverUrl?: string | null;
  upvotesCount?: number;
  commentsCount?: number;
}

export function WorkCard({ id, title, author, category, href, coverUrl, upvotesCount, commentsCount }: WorkCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        {/* Cover Area */}
        <div className="h-48 bg-[var(--color-paper)] relative flex items-center justify-center overflow-hidden border-b border-[var(--color-paper-faint)]">
          {coverUrl ? (
            <img src={coverUrl} alt={`Couverture de ${title}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="text-[var(--color-brass)] opacity-50 font-serif italic text-2xl group-hover:scale-105 transition-transform duration-500">
              Couverture
            </div>
          )}
          <div className="absolute top-3 left-3 bg-[var(--color-garnet)] text-[var(--color-paper-card)] text-[10px] font-mono tracking-wider uppercase px-2 py-1 rounded">
            {category}
          </div>
        </div>
        
        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-serif text-xl font-medium text-[var(--color-ink)] mb-1 line-clamp-2">
            {title}
          </h3>
          <p className="font-sans text-sm text-[var(--color-ink-text)] opacity-70 mb-4 line-clamp-1">
            {author}
          </p>
          
          <div className="mt-auto pt-4 border-t border-[var(--color-paper-faint)] flex items-center justify-between">
            <span className="font-mono text-xs text-[var(--color-brass)] group-hover:text-[var(--color-garnet)] transition-colors">
              Gérer / Voir →
            </span>
            <div className="flex gap-3">
              {upvotesCount !== undefined && (
                <div className="flex items-center gap-1 text-[var(--color-ink-text)] opacity-60">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-garnet)]"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  <span className="text-xs font-mono font-medium">{upvotesCount}</span>
                </div>
              )}
              {commentsCount !== undefined && (
                <div className="flex items-center gap-1 text-[var(--color-ink-text)] opacity-60">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-brass)]"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                  <span className="text-xs font-mono font-medium">{commentsCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
