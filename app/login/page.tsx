"use client";

import Link from "next/link";
import styles from "./login.module.css";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    if (data.user) {
      // Fetch role to redirect appropriately
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      const role = profile?.role || 'student';
      router.push(`/dashboard/${role}`);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <div className={styles.brandmark}>
          <span className={styles.dot}></span>PLATEFORME LITTÉRAIRE
        </div>

        <div className={styles.quoteBlock}>
          <div className={styles.quoteEyebrow}>Fiche N° 0142 — Extrait consulté</div>
          <div className={styles.quote}>
            « Lire, c’est <span className={styles.accent}>annoter</span> le monde<br />
            avant de le <span className={styles.accent}>comprendre</span>. »
          </div>
          <div className={styles.quoteAttr}>— pensée de lecture, marge d’étudiant</div>
        </div>

        <div className={styles.leftFoot}>
          <span><b>240+</b> œuvres au catalogue</span>
          <span><b>Étudiant · Enseignant · Admin</b></span>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <div className={styles.punch}></div>

          <div className={styles.cardHead}>
            <div>
              <div className={styles.ficheLabel}>Fiche d'accès</div>
              <div className={styles.ficheTitle}>Se connecter</div>
            </div>
            <div className={styles.ficheNum}>
              N° 0142<br />
              ÉD. 2026
            </div>
          </div>

          <form className={styles.cardBody} onSubmit={handleLogin}>
            <div className={styles.field}>
              <label htmlFor="email">Adresse e-mail</label>
              <input
                id="email"
                type="email"
                placeholder="prenom.nom@univ.dz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="pass">Mot de passe</label>
              <input
                id="pass"
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm mb-4 font-sans">{error}</div>
            )}

            <div className={styles.rowBetween}>
              <label className={styles.remember}>
                <input type="checkbox" /> Se souvenir de moi
              </label>
              <a href="#" className={styles.forgot}>
                Mot de passe oublié ?
              </a>
            </div>

            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            <div className={styles.divider}>Nouveau sur la plateforme</div>

            <div className={styles.signupLine}>
              Pas encore de compte ?{" "}
              <Link href="/signup">Créer un compte étudiant</Link>
            </div>

            <div className={styles.stamp}>
              <div className={styles.stampText}>
                UNIV.<br />DZ<br />2026
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
