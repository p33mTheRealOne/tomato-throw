/** Skeleton shown while the picture page is being fetched on the server. */
export default function Loading() {
  return (
    <div className="stage stage-loading" aria-busy="true">
      <div className="stage-skeleton skeleton" />
      <p className="sr-only" role="status">
        Loading picture…
      </p>
      <div className="hud" aria-hidden="true">
        <span className="hud-skel skeleton" />
        <span className="hud-skel skeleton" />
        <span className="hud-skel hud-skel-wide skeleton" />
        <span className="hud-skel skeleton" />
      </div>
    </div>
  );
}
