type ColorPaletteProps = {
  colors: string[];
};

export default function ColorPalette({ colors }: ColorPaletteProps) {
  return (
    <section aria-labelledby="palette-heading">
      <h2 id="palette-heading">Color palette</h2>
      <ul className="palette">
        {colors.map((color) => (
          <li
            key={color}
            style={{ backgroundColor: color }}
            title={color}
            aria-label={color}
          />
        ))}
      </ul>
    </section>
  );
}
