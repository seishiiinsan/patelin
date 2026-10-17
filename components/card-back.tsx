// The back of a card, shown before it is turned over.
export function CardBack() {
  return (
    <div aria-hidden="true" className="@container w-full">
      <div
        className="flex aspect-[5/7] w-full items-center justify-center overflow-hidden rounded-[6cqw] border-[2.5cqw] border-white/70 bg-brand shadow-md"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgb(255 255 255 / 0.18) 0 6%, transparent 7%), radial-gradient(circle at 75% 75%, rgb(255 255 255 / 0.18) 0 6%, transparent 7%)",
          backgroundSize: "24cqw 24cqw",
        }}
      >
        <span className="-rotate-12 rounded-[4cqw] bg-white px-[5cqw] py-[2cqw] font-display text-[13cqw] font-semibold text-brand shadow">
          Patelin
        </span>
      </div>
    </div>
  );
}
