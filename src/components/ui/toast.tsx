import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";

// Re-export Radix Toast primitives for centralized styling
export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = ToastPrimitive.Viewport;
export const Toast = ToastPrimitive.Root;
export const ToastTitle = ToastPrimitive.Title;
export const ToastDescription = ToastPrimitive.Description;
export const ToastClose = ToastPrimitive.Close;

// Optionally wrap with React.forwardRef for custom styling if needed
