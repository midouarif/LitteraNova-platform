import { createClient } from "@/utils/supabase/server";
import { WorkCard } from "@/components/ui/work-card";
import Link from "next/link";
import { Search } from "lucide-react";

export default async function StudentLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  
  const query = typeof resolvedParams.q === "string" ? resolvedParams.q : "";
  const category = typeof resolvedParams.category === "string" ? resolvedParams.category : "";

  let dbQuery = supabase
    .from("works")
    .select("*, work_comments(count)")
    .order("upvotes_count", { ascending: false })
    .order("created_at", { ascending: false });

  if (category) {
    dbQuery = dbQuery.eq("category", category);
  }

  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }

  const { data: works, error } = await dbQuery;

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-[var(--color-ink)] mb-2">Catalogue</h2>
        <p className="text-[var(--color-ink-text)] opacity-70 font-sans">
          Explorez les œuvres disponibles dans la bibliothèque.
        </p>
      </div>

      <div className="bg-[var(--color-paper-card)] border border-[var(--color-paper-faint)] rounded-xl p-4 mb-8 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <form className="flex-1 relative w-full" action="/dashboard/student/library" method="GET">
          {category && <input type="hidden" name="category" value={category} />}
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-text)] opacity-50" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Rechercher une œuvre..."
            className="w-full bg-[var(--color-paper)] border border-[var(--color-paper-faint)] rounded-lg pl-10 pr-3 py-2 text-sm font-sans text-[var(--color-ink-text)] focus:outline-none focus:border-[var(--color-garnet)] transition-colors"
          />
        </form>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
          <FilterPill label="Tous" active={!category} href={`/dashboard/student/library${query ? `?q=${query}` : ''}`} />
          <FilterPill label="Romans" active={category === "roman"} href={`/dashboard/student/library?category=roman${query ? `&q=${query}` : ''}`} />
          <FilterPill label="Poésie" active={category === "poesie"} href={`/dashboard/student/library?category=poesie${query ? `&q=${query}` : ''}`} />
          <FilterPill label="Théâtre" active={category === "theatre"} href={`/dashboard/student/library?category=theatre${query ? `&q=${query}` : ''}`} />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6 border border-red-100">
          Erreur lors du chargement du catalogue.
        </div>
      )}

      {works && works.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {works.map((work) => (
            <WorkCard
              key={work.id}
              id={work.id}
              title={work.title}
              author={work.author}
              category={work.category}
              href={`/dashboard/student/library/${work.id}`}
              coverUrl={work.cover_url}
              upvotesCount={work.upvotes_count}
              commentsCount={work.work_comments?.[0]?.count || 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-[var(--color-ink-text)] opacity-50 font-sans">
            Aucune œuvre trouvée pour cette recherche.
          </p>
        </div>
      )}
    </div>
  );
}

function FilterPill({ label, active, href }: { label: string, active: boolean, href: string }) {
  return (
    <Link
      href={href}
      className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase transition-colors whitespace-nowrap ${
        active 
          ? "bg-[var(--color-garnet)] text-[var(--color-paper-card)]" 
          : "bg-[var(--color-paper)] text-[var(--color-ink-text)] border border-[var(--color-paper-faint)] hover:border-[var(--color-garnet)]"
      }`}
    >
      {label}
    </Link>
  );
}
