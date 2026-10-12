import type { CSSProperties } from "react";
import { CARD_COLORS } from "../types";

export interface ColorOption<T extends string = string> {
  id: T;
  label: string;
  value: string;
}

/** Swatches for choosing a color. Keyboard accessible: arrow keys move between swatches. */
export function ColorPicker<T extends string = string>({
  value,
  onChange,
  colors = CARD_COLORS as unknown as readonly ColorOption<T>[],
  name = "color-picker",
  hint = "This color personalizes your item.",
}: {
  value: T;
  onChange: (next: T) => void;
  colors?: readonly ColorOption<T>[] | ColorOption<T>[];
  name?: string;
  hint?: string;
}) {
  const selected = colors.find((c) => c.id === value);

  return (
    <div>
      <div className="inc-colors" role="radiogroup" aria-label={name}>
        {colors.map((c) => (
          <label className="inc-swatch" key={c.id} title={c.label} style={{ "--c": c.value } as CSSProperties}>
            <input
              type="radio"
              name={name}
              value={c.id}
              checked={value === c.id}
              aria-label={c.label}
              onChange={() => onChange(c.id)}
            />
            <span aria-hidden="true">
              <svg className="tick" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14143A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </span>
          </label>
        ))}
      </div>
      <p className="inc-hint" style={{ marginTop: ".5rem" }}>
        Selected: <strong>{selected?.label ?? value}</strong>. {hint}
      </p>
    </div>
  );
}
