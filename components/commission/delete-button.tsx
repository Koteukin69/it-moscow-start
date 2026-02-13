'use client';

import {Button} from "@/components/ui/button";
import {Trash2, Loader2} from "lucide-react";

interface DeleteButtonProps {
  loading: boolean;
  onClick: () => void;
}

export default function DeleteButton({loading, onClick}: DeleteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="text-destructive hover:text-destructive"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
    </Button>
  );
}
