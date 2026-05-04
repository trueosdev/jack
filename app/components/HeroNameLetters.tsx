"use client";

const NAME = "Jack Lyons";

/** Per-letter font stacks on hover (space unchanged). Keys are lowercase ASCII. */
const FONT_BY_LETTER: Record<string, string> = {
  // J — monospace / code vibes
  j: 'ui-monospace, "Cascadia Code", "Consolas", monospace',
  a: '"Georgia", "Times New Roman", ui-serif, serif',
  c: '"Comic Sans MS", "Comic Sans", cursive',
  k: '"Trebuchet MS", "Lucida Grande", sans-serif',
  l: '"Times New Roman", Times, ui-serif, serif',
  y: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
  o: 'ui-rounded, "Hiragino Maru Gothic ProN", system-ui, sans-serif',
  n: '"Papyrus", fantasy',
  s: '"Segoe Script", "Brush Script MT", "Apple Chancery", cursive',
};

function letterMods(char: string): string {
  switch (char.toLowerCase()) {
    case "n":
      return " hero-name-letter--optical-lift";
    case "s":
    case "o":
    case "n":
      return " hero-name-letter--weight-light";
    default:
      return "";
  }
}

export function HeroNameLetters() {
  return (
    <span className="hero-name-track">
      {NAME.split("").map((char, i) => (
        <span
          key={`${char}-${i}`}
          className={
            char === " "
              ? "hero-name-letter hero-name-letter--space"
              : `hero-name-letter${letterMods(char)}`
          }
          onPointerEnter={(e) => {
            if (char === " ") {
              return;
            }
            const stack = FONT_BY_LETTER[char.toLowerCase()];
            if (stack) {
              e.currentTarget.style.fontFamily = stack;
            }
          }}
          onPointerLeave={(e) => {
            e.currentTarget.style.fontFamily = "";
          }}
        >
          {char === " " ? "\u00a0" : char}
        </span>
      ))}
    </span>
  );
}
