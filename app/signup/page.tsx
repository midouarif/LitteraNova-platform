"use client";

import Link from "next/link";
import styles from "../login/login.module.css";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setError("Cet utilisateur existe déjà.");
      setLoading(false);
      return;
    }

    setSuccess("Inscription réussie. Veuillez vérifier vos e-mails.");
    setLoading(false);
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
              <div className={styles.ficheLabel}>Fiche d'inscription</div>
              <div className={styles.ficheTitle}>Créer un compte</div>
            </div>
            <div className={styles.ficheNum}>
              N° 0142<br />
              ÉD. 2026
            </div>
          </div>

          <form className={styles.cardBody} onSubmit={handleSignup}>
            <div className={styles.field}>
              <label htmlFor="fullName">Nom complet</label>
              <input
                id="fullName"
                type="text"
                placeholder="Prénom Nom"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
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
            
            {success && (
              <div className="text-green-600 text-sm mb-4 font-sans">{success}</div>
            )}

            <button type="submit" className={styles.btnPrimary} style={{marginTop: '20px'}} disabled={loading}>
              {loading ? "Création..." : "S'inscrire"}
            </button>

            <div className={styles.divider}>Déjà un compte ?</div>

            <div className={styles.signupLine}>
              <Link href="/login">Se connecter</Link>
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
