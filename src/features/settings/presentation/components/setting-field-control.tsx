"use client";

import type { DashboardSettingField } from "@/src/core/types/dashboard";

type Props = {
  field: DashboardSettingField;
  /** Accessible name, e.g. "Returns Return window". */
  name: string;
  onChange: (value: string) => void;
};

/**
 * The control for one setting, chosen by its type. Values stay text: integers as digits,
 * booleans as "true"/"false", multi-choice as comma-joined values in the listed order.
 * The API validates again, so these limits are a convenience, not the guard.
 */
export function SettingFieldControl({ field, name, onChange }: Props) {
  const { options } = field;
  const locked = options.locked === true;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {renderControl()}
      {locked ? (
        <span style={hintStyle}>🔒 Fixed. {options.helpText}</span>
      ) : options.helpText ? (
        <span style={hintStyle}>{options.helpText}</span>
      ) : null}
    </div>
  );

  function renderControl() {
    switch (field.type) {
      case "boolean": {
        const checked = field.value === "true";
        return (
          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: locked ? "not-allowed" : "pointer" }}>
            <input
              type="checkbox"
              role="switch"
              aria-label={name}
              checked={checked}
              disabled={locked}
              onChange={(event) => onChange(event.target.checked ? "true" : "false")}
              style={{ width: 22, height: 22, accentColor: "var(--color-surface-inverse)" }}
            />
            <span style={{ fontWeight: 600 }}>{checked ? "On" : "Off"}</span>
          </label>
        );
      }

      case "integer":
        return (
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="number"
              inputMode="numeric"
              aria-label={name}
              min={options.min}
              max={options.max}
              step={1}
              disabled={locked}
              value={field.value}
              onChange={(event) => onChange(event.target.value)}
              style={{ ...inputStyle, width: 120 }}
            />
            {options.unit ? <span style={{ color: "var(--color-text-muted)" }}>{options.unit}</span> : null}
          </span>
        );

      case "choice":
        return (
          <select
            aria-label={name}
            disabled={locked}
            value={field.value}
            onChange={(event) => onChange(event.target.value)}
            style={inputStyle}
          >
            {(options.choices ?? []).map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </select>
        );

      case "multi_choice": {
        const choices = options.choices ?? [];
        const selected = new Set(field.value.split(",").filter(Boolean));
        return (
          <fieldset aria-label={name} disabled={locked} style={{ border: 0, margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 10 }}>
            {choices.map((choice) => (
              <label key={choice.value} style={chipStyle(selected.has(choice.value))}>
                <input
                  type="checkbox"
                  checked={selected.has(choice.value)}
                  onChange={(event) => {
                    const next = new Set(selected);
                    if (event.target.checked) next.add(choice.value);
                    else next.delete(choice.value);
                    onChange(choices.map((c) => c.value).filter((value) => next.has(value)).join(","));
                  }}
                />
                {choice.label}
              </label>
            ))}
          </fieldset>
        );
      }

      default:
        return (
          <input
            type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
            aria-label={name}
            required={options.required}
            maxLength={options.maxLength}
            disabled={locked}
            value={field.value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={field.type === "url" ? "https://" : undefined}
            style={inputStyle}
          />
        );
    }
  }
}

const inputStyle = {
  border: "1px solid var(--color-border)",
  borderRadius: 16,
  padding: "14px 16px",
  background: "var(--color-surface)",
} as const;

const hintStyle = { color: "var(--color-text-muted)", fontSize: 12, lineHeight: 1.5 } as const;

function chipStyle(active: boolean) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    border: `1px solid ${active ? "var(--color-surface-inverse)" : "var(--color-border)"}`,
    borderRadius: "var(--radius-pill)",
    padding: "10px 14px",
    background: active ? "rgba(26, 20, 16, 0.06)" : "var(--color-surface)",
    fontWeight: 600,
    whiteSpace: "nowrap",
    cursor: "pointer",
  } as const;
}
