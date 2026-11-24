"use client";

import type { ReactNode } from "react";
import type { AccentName, BoardSize, BoardTheme, ThemeName } from "@/store/settings-store";
import { useSettingsStore } from "@/store/settings-store";
import { Switch } from "@/components/ui/switch";

export function SettingsForm() {
  const settings = useSettingsStore();

  return (
    <section>
      <p className="text-sm text-muted">Settings</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">Make it yours.</h1>
      <div className="mt-10 space-y-10">
        <Group title="Appearance">
          <Choice
            label="Theme"
            value={settings.theme}
            options={[
              ["light", "Light"],
              ["dark", "Dark"],
            ]}
            onChange={(theme) => settings.update({ theme: theme as ThemeName })}
          />
          <Choice
            label="Board"
            value={settings.boardTheme}
            options={[
              ["paper", "Paper"],
              ["night", "Night"],
              ["graphite", "Graphite"],
            ]}
            onChange={(boardTheme) => settings.update({ boardTheme: boardTheme as BoardTheme })}
          />
          <Choice
            label="Accent"
            value={settings.accent}
            options={[
              ["teal", "Teal"],
              ["indigo", "Indigo"],
              ["copper", "Copper"],
            ]}
            onChange={(accent) => settings.update({ accent: accent as AccentName })}
          />
          <Choice
            label="Size"
            value={settings.boardSize}
            options={[
              ["small", "Small"],
              ["medium", "Medium"],
              ["large", "Large"],
            ]}
            onChange={(boardSize) => settings.update({ boardSize: boardSize as BoardSize })}
          />
        </Group>
        <Group title="Assistance">
          <Toggle label="Show conflicts as you play" checked={settings.autoCheck} onChange={(autoCheck) => settings.update({ autoCheck })} />
          <Toggle label="Count mistakes" checked={settings.mistakeCounting} onChange={(mistakeCounting) => settings.update({ mistakeCounting })} />
          <Toggle label="Automatic candidates" checked={settings.autoCandidates} onChange={(autoCandidates) => settings.update({ autoCandidates })} />
        </Group>
        <Group title="Feel">
          <Toggle label="Sound" checked={settings.sound} onChange={(sound) => settings.update({ sound })} />
          <Toggle label="Motion" checked={settings.motion} onChange={(motion) => settings.update({ motion })} />
        </Group>
      </div>
    </section>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-sm uppercase tracking-[0.16em] text-muted">{title}</h2>
      <div className="mt-3 divide-y divide-line border-y border-line">{children}</div>
    </section>
  );
}

function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <span>{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map(([id, name]) => (
          <button
            key={id}
            type="button"
            aria-pressed={value === id}
            onClick={() => onChange(id)}
            className={
              value === id
                ? "border border-ink bg-ink px-3 py-1.5 text-sm text-paper"
                : "border border-line px-3 py-1.5 text-sm text-muted"
            }
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-4">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </label>
  );
}
