/**
 * Light-theme loading state for the wallet. The default ShimLoader renders no
 * background, so it inherited the root layout's near-black `#0a0a0a` and the
 * wallet appeared to open onto a blank black screen — wrong for a light page.
 *
 * The skeleton IS the loading state. An earlier version also stacked a
 * <ShimLoader> spinner *below* these cards, which read as misplaced: ShimLoader
 * carries `min-h-[60vh]` and centres the spinner inside its own box, so it
 * landed at (skeleton height + 30vh) rather than the viewport centre — measured
 * 381px below centre in an 800px viewport. The skeleton already says "content is
 * arriving", so the spinner was redundant as well as off-centre. The skeleton
 * cards are sized to the real content, so the arrival is a fill-in rather than
 * a layout jump.
 */
export default function PortalLoading() {
  return (
    <div className="flex-1 w-full font-sans overflow-hidden">
      <div className="max-w-5xl mx-auto w-full px-6 sm:px-8 py-6">
        {/* Holder card — geometry copied from the real card so arrival is a
            fill-in, not a jump. The action side is a stacked PAIR of h-10
            buttons (the real card's "Show check-in pass" + "Verify a
            credential"), not one block; getting that wrong shifted every card
            below it by 20px. */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm mb-6">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
            <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
              <div className="w-16 h-16 shrink-0 bg-zinc-100 rounded-xl animate-pulse" />
              <div className="flex-1 space-y-2.5">
                <div className="h-2.5 w-24 bg-zinc-100 rounded animate-pulse" />
                <div className="h-7 w-48 bg-zinc-100 rounded animate-pulse" />
                <div className="h-2.5 w-32 bg-zinc-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="shrink-0 flex flex-col gap-2 w-full sm:w-auto">
              <div className="h-10 w-full sm:w-44 bg-zinc-100 rounded-xl animate-pulse" />
              <div className="h-10 w-full sm:w-44 bg-zinc-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Metric ribbon — same 1px-gap grid on a zinc-200 bed. Cell internals
            mirror the real cell: label, then an `mt-1.5` value block standing in
            for the text-3xl AnimatedNumber. */}
        <div className="bg-zinc-200 border border-zinc-200 rounded-xl shadow-sm mb-6 grid grid-cols-2 lg:grid-cols-4 gap-[1px] overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5">
              <div className="h-5 w-20 bg-zinc-100 rounded animate-pulse" />
              <div className="mt-1.5 h-9 w-12 bg-zinc-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Credentials card — header heights mirror the real card (text-lg
            title + text-sm subtitle stack, and the inset-shadow count badge). */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm">
          <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
            <div>
              <div className="h-7 w-40 bg-zinc-100 rounded animate-pulse" />
              <div className="mt-0.5 h-5 w-28 bg-zinc-100 rounded animate-pulse" />
            </div>
            <div className="h-7 w-20 bg-zinc-100 rounded-md animate-pulse" />
          </div>
          {/* 320px tall to match the real card body (EmptyLedger's centring
              well, and the populated list), so the content swap on arrival
              fills the same box instead of shifting the page. */}
          <div className="h-[320px] p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 shrink-0 bg-zinc-100 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/4 bg-zinc-100 rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-zinc-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
