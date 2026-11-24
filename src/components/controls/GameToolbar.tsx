"use client";

import { Eraser, Lightbulb, Pencil, Redo2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function GameToolbar({
  notesMode,
  notesDisabled,
  disabled,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onErase,
  onNotes,
  onHint,
}: {
  notesMode: boolean;
  notesDisabled?: boolean;
  disabled?: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onErase: () => void;
  onNotes: () => void;
  onHint: () => void;
}) {
  const items = [
    { label: "Undo", hint: "Undo (⌘Z)", icon: Undo2, onClick: onUndo, disabled: disabled || !canUndo, pressed: false },
    { label: "Redo", hint: "Redo (⇧⌘Z)", icon: Redo2, onClick: onRedo, disabled: disabled || !canRedo, pressed: false },
    { label: "Erase", hint: "Erase (Delete)", icon: Eraser, onClick: onErase, disabled, pressed: false },
    { label: "Notes", hint: "Notes (N)", icon: Pencil, onClick: onNotes, disabled: disabled || notesDisabled, pressed: notesMode },
    { label: "Hint", hint: "Hint (H)", icon: Lightbulb, onClick: onHint, disabled, pressed: false },
  ];

  return (
    <div className="grid grid-cols-5 gap-1" aria-label="Game actions">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Tooltip key={item.label} label={item.hint}>
            <Button
              type="button"
              variant={item.pressed ? "solid" : "outline"}
              className={cn("h-12 w-full flex-col gap-1 px-1 text-[11px]", item.pressed && "bg-ink text-paper")}
              disabled={item.disabled}
              aria-pressed={item.pressed}
              aria-label={item.label}
              onClick={item.onClick}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Button>
          </Tooltip>
        );
      })}
    </div>
  );
}
