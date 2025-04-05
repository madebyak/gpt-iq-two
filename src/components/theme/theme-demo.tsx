"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeDemo() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="container mx-auto max-w-screen-xl py-10">
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl font-bold">Current Theme: {theme}</h2>
        <div className="flex gap-4">
          <Button onClick={() => setTheme("light")}>Light Mode</Button>
          <Button onClick={() => setTheme("dark")}>Dark Mode</Button>
          <Button onClick={() => setTheme("system")}>System</Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">Background Colors</h3>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md bg-background border"></div>
              <span>Background</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md bg-card border"></div>
              <span>Card</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md bg-muted border"></div>
              <span>Muted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md bg-accent border"></div>
              <span>Accent</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-semibold">Brand Colors</h3>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md bg-primary border"></div>
              <span>Primary (Green)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md bg-secondary border"></div>
              <span>Secondary (Blue)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md bg-destructive border"></div>
              <span>Destructive (Orange)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md hsl(var(--purple)) border"></div>
              <span>Purple</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-xl font-semibold">Text Colors</h3>
        <div className="space-y-2">
          <p className="text-foreground">Text Foreground</p>
          <p className="text-muted-foreground">Text Muted</p>
          <p className="text-primary">Text Primary</p>
          <p className="text-secondary">Text Secondary</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-xl font-semibold">UI Components with Theme</h3>
        <div className="flex flex-wrap gap-4">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>
        <div className="flex flex-col space-y-2 mt-4">
          <div className="rounded-md border p-4 bg-card">
            <p className="font-medium">Card Component</p>
            <p className="text-muted-foreground">This is how cards look in the current theme.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
