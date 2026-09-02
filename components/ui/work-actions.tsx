"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteWork } from "@/app/actions/works";
import { Trash2 } from "lucide-react";

export function WorkActions({ workId }: { workId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette œuvre ? Cette action est irréversible.")) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteWork(workId);

      if (result.error) {
        alert(result.error);
        setLoading(false);
      } else {
        router.push("/dashboard/teacher/works");
      }
    } catch (err: any) {
      alert("Erreur de connexion au serveur. " + err.message);
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" 
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 size={16} className="mr-2" />
      {loading ? "Suppression..." : "Supprimer"}
    </Button>
  );
}
