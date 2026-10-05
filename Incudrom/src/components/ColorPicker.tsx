import type { CSSProperties } from "react";
import { CARD_COLORS } from "../types";
import type { CardColor } from "../types";

/** Swatches for choosing an idea card color. Keyboard accessible: arrow keys move between swatches. */
export function ColorPicker({
  value,
  onChange,
  name = "card-color",
}: {
  value: CardColor;
  onChange: (next: CardColor) => void;
  name?: string;
}) {
  const selected = CARD_COLORS.find((c) => c.id === value);

  return (
    <div>
      <div className="inc-colors" role="radiogroup" aria-label="Card color">
        {CARD_COLORS.map((c) => (
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
        Selected: {selected?.label}. This color shows on your idea card.
      </p>
    </div>
  );
}
