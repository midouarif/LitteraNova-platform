import Link from "next/link";

interface WorkCardProps {
  id: string;
  title: string;
  author: string;
  category: string;
  href: string;
  coverUrl?: string | null;
}

export function WorkCard({ id, title, author, category, href, coverUrl }: WorkCardProps) {
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
          </div>
        </div>
      </div>
    </Link>
  );
}
