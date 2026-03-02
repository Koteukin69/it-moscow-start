'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = 'privacy-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 border-t border-border bg-background/95 backdrop-blur px-4 py-3 sm:px-6">
      <p className="text-sm text-muted-foreground">
        Заходя на сайт, вы соглашаетесь с обработкой и хранением персональных данных
      </p>
      <Button size="sm" onClick={accept}>
        ОК
      </Button>
    </div>
  );
}
