"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteActivity } from "@/app/actions/activities";
import { Trash2 } from "lucide-react";

export function DeleteActivityButton({ activityId }: { activityId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce quiz ? Cette action est irréversible.")) {
      return;
    }

    setLoading(true);
    const result = await deleteActivity(activityId);

    if (result.error) {
      alert(result.error);
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-full md:w-auto rounded-xl" 
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 size={16} className="md:mr-2" />
      <span className="hidden md:inline">{loading ? "Suppression..." : "Supprimer"}</span>
    </Button>
  );
}
