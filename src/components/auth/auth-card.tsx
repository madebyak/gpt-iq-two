"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function AuthCard({ 
  title, 
  subtitle, 
  children,
  className 
}: AuthCardProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
      <Card className={cn("w-full max-w-md shadow-xl bg-card/90 backdrop-blur-sm", className)}>
        <CardHeader className="space-y-2 text-center py-6 pb-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          )}
        </CardHeader>
        <CardContent className="px-8 pt-4 pb-8">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
