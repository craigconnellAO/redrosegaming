'use client';

import { useState } from 'react';
import {
  STUDIO_COLORS, STUDIO_FONTS, fontCssFamily, makeOverlayId,
  type StudioFont, type TextOverlay,
} from '@/lib/studio';

interface Props {
  overlays: TextOverlay[];
  onChange: (next: TextOverlay[]) => void;
  /** Source-video duration; used as default end-time for new overlays. */
  duration: number;
  /** Current playback time; new overlays default to start here. */
  currentTime: number;
}

export function TextOverlayEditor({ overlays, onChange, duration, currentTime }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addOverlay = () => {
    const start = Math.max(0, currentTime);
    // Default to spanning the rest of the video so kids see the caption persist.
    // Falls back to 5s if duration isn't known yet.
    const end = duration > 0 ? duration : start + 5;
    const next: TextOverlay = {
      id: makeOverlayId(),
      text: 'New text',
      font: 'fredoka',
      color: STUDIO_COLORS[0].value,
      x: 0.5,
      y: 0.18,
      size: 0.10,
      startTime: start,
      endTime: end,
    };
    onChange([...overlays, next]);
    setEditingId(next.id);
  };

  const updateOne = (id: string, patch: Partial<TextOverlay>) => {
    onChange(overlays.map(o => (o.id === id ? { ...o, ...patch } : o)));
  };

  const removeOne = (id: string) => {
    onChange(overlays.filter(o => o.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <section
      className="card"
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}
      aria-labelledby="overlays-heading"
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 id="overlays-heading" className="section-label">Text Overlays</h3>
        <button className="btn btn-primary" onClick={addOverlay} style={{ minHeight: 44 }}>
          + Add text
        </button>
      </header>

      {overlays.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--sub)', padding: '12px 4px' }}>
          No text yet. Tap <strong>Add text</strong> to drop a caption on screen.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {overlays.map(o => (
            <li
              key={o.id}
              className="card"
              style={{
                padding: 12,
                background: 'var(--bg)',
                borderColor: editingId === o.id ? 'var(--accent)' : 'var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  aria-hidden
                  style={{
                    fontFamily: fontCssFamily(o.font),
                    color: o.color === '#FFFFFF' ? 'var(--text)' : o.color,
                    fontSize: 18,
                    flex: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    textShadow: o.color === '#FFFFFF' ? 'none' : '0 1px 0 rgba(0,0,0,0.05)',
                  }}
                >
                  {o.text || '—'}
                </span>
                <button
                  className="icon-btn"
                  onClick={() => setEditingId(editingId === o.id ? null : o.id)}
                  aria-label={editingId === o.id ? 'Collapse editor' : 'Edit overlay'}
                  aria-expanded={editingId === o.id}
                >
                  {editingId === o.id ? '−' : '✎'}
                </button>
                <button
                  className="icon-btn"
                  onClick={() => removeOne(o.id)}
                  aria-label={`Delete overlay "${o.text}"`}
                >
                  ✕
                </button>
              </div>

              {editingId === o.id && (
                <OverlayFields
                  overlay={o}
                  duration={duration}
                  onPatch={p => updateOne(o.id, p)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function OverlayFields({
  overlay, duration, onPatch,
}: {
  overlay: TextOverlay;
  duration: number;
  onPatch: (p: Partial<TextOverlay>) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="section-label">Text</span>
        <input
          className="input"
          value={overlay.text}
          onChange={e => onPatch({ text: e.target.value })}
          maxLength={60}
          placeholder="Type a caption…"
        />
      </label>

      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="section-label" style={{ marginBottom: 6 }}>Font</legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {STUDIO_FONTS.map(f => (
            <FontChip
              key={f.id}
              font={f.id}
              label={f.label}
              cssFamily={f.cssFamily}
              selected={overlay.font === f.id}
              onSelect={() => onPatch({ font: f.id })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="section-label" style={{ marginBottom: 6 }}>Colour</legend>
        <div role="radiogroup" aria-label="Text colour" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {STUDIO_COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={overlay.color === c.value}
              aria-label={c.label}
              className="color-swatch"
              onClick={() => onPatch({ color: c.value })}
              style={{ background: c.value }}
            />
          ))}
        </div>
      </fieldset>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="section-label">Size</span>
        <input
          type="range"
          className="studio-range"
          min={0.04}
          max={0.22}
          step={0.005}
          value={overlay.size}
          onChange={e => onPatch({ size: parseFloat(e.target.value) })}
          aria-valuetext={`${Math.round(overlay.size * 100)} percent of frame height`}
        />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="section-label">Show from (s)</span>
          <input
            type="number"
            className="input"
            min={0}
            max={duration || 999}
            step={0.1}
            value={overlay.startTime.toFixed(1)}
            onChange={e => {
              const v = Math.max(0, parseFloat(e.target.value) || 0);
              onPatch({ startTime: Math.min(v, overlay.endTime - 0.1) });
            }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="section-label">Hide at (s)</span>
          <input
            type="number"
            className="input"
            min={0}
            max={duration || 999}
            step={0.1}
            value={overlay.endTime.toFixed(1)}
            onChange={e => {
              const v = Math.max(overlay.startTime + 0.1, parseFloat(e.target.value) || 0);
              onPatch({ endTime: v });
            }}
          />
        </label>
      </div>
    </div>
  );
}

function FontChip({
  font, label, cssFamily, selected, onSelect,
}: {
  font: StudioFont;
  label: string;
  cssFamily: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${label} font`}
      style={{
        minHeight: 44,
        padding: '8px 14px',
        borderRadius: 'var(--radius-md)',
        border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        background: selected ? 'var(--accent-light)' : 'var(--card)',
        color: 'var(--text)',
        fontFamily: cssFamily,
        fontSize: font === 'press' ? 12 : 18,
        cursor: 'pointer',
        transition: 'all 0.15s var(--ease)',
      }}
    >
      Aa
    </button>
  );
}
