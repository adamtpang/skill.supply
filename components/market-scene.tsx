"use client";

import { Bar, Row, Stage, Text, Window } from "@/components/stageshow/kit";
import { RISING } from "@/lib/market";
import "./market-scene.css";

// The hero's anchor, built to the Stageshow method: a still product shot of
// the real report's "Where you're wanted" section, cropped off the right and
// bottom, with the one real market figure as a satellite on its left edge
// (wide only; the phone design drops it and the caption carries the figure).
//
// Word budget (the only real strings): the address, the section name, three
// targets with their fit scores, and the AI demand figure with its label.
// Everything else is placeholder. The targets and scores are the same
// illustrative examples the previous card used, and the caption under the
// stage says so; the 5.9% is the sourced Indeed Hiring Lab figure. Five
// cards in all, as the real report always lists five.
const TARGETS = [
  { name: "Fintech infra, Series A", fit: 86 },
  { name: "Payments API startup", fit: 81 },
  { name: "Vertical SaaS, ops-heavy", fit: 77 },
] as const;

// The last two targets as filler: the demand card covers them and the crop
// takes the fifth.
const FILLER = [
  { name: 118, fit: 64 },
  { name: 92, fit: 58 },
];

function Score({ fit }: { fit: number }) {
  return (
    <span className="mk-score">
      <span className="mk-score__value">
        <Text className="mk-score__num">{String(fit)}</Text>
        <Text className="mk-score__of">/100</Text>
      </span>
      <span className="mk-score__track">
        <span className="mk-score__fill" style={{ width: `${fit}%` }} />
      </span>
    </span>
  );
}

function FillerScore({ fit }: { fit: number }) {
  return (
    <span className="mk-score">
      <span className="mk-score__value mk-score__value--filler">
        <Bar w={30} h={6} tone={3} />
      </span>
      <span className="mk-score__track">
        <span className="mk-score__fill mk-score__fill--quiet" style={{ width: `${fit}%` }} />
      </span>
    </span>
  );
}

export function MarketScene() {
  return (
    <Stage
      width={500}
      height={400}
      compact={{ below: 440, width: 350, height: 320 }}
      greys="cool"
      className="mk-scene"
    >
      {(_state, _rect, layout) => (
        <>
          <Window url="skill.supply" urlShape="pill" className="mk-window" body={{ className: "mk-body" }}>
            <div className="mk-column">
              <Text className="mk-eyebrow">Where you&rsquo;re wanted</Text>
              <div className="mk-list">
                {TARGETS.map((t, i) => (
                  <div key={t.name} className="mk-card" data-top={i === 0 || undefined}>
                    <Row pad={14} title={<Text className="mk-name">{t.name}</Text>}>
                      <Score fit={t.fit} />
                    </Row>
                  </div>
                ))}
                {FILLER.map((f, i) => (
                  <div key={i} className="mk-card">
                    <Row pad={14} title={<Bar w={f.name} h={6} tone={3} />}>
                      <FillerScore fit={f.fit} />
                    </Row>
                  </div>
                ))}
              </div>
            </div>
          </Window>

          {layout === "wide" && (
            <div className="mk-demand">
              <Text className="mk-demand__value">{RISING.value}</Text>
              <Text className="mk-demand__label">of US job postings mention AI</Text>
            </div>
          )}
        </>
      )}
    </Stage>
  );
}
