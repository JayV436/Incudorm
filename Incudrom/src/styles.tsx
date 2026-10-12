/**
 * Shared styles for every in-app page. Same tokens and look as the landing page.
 * Render <AppStyles /> once inside any tree that uses the pages (AppShell and AuthPage already do).
 * All selectors are scoped under .incudorm and prefixed inc-.
 */
export function AppStyles() {
  return <style>{CSS}</style>;
}

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap");

.incudorm{
  --inc-bg:#F3F2FF; --inc-ink:#14143A; --inc-muted:#55557A; --inc-paper:#FFFFFF; --inc-line:#D6D4F4;
  --inc-brand:#3B3BFF; --inc-sun:#FFD23F; --inc-mint:#46E0A0; --inc-lilac:#CFCBFF; --inc-pop-ink:#14143A;
  --inc-dot:#C9C6EF; --inc-chip:#ECEBFF; --inc-ok:#0C8A5B; --inc-err:#D62F4B; --inc-link:#3030E0;
  --inc-display:"Bricolage Grotesque","Trebuchet MS",system-ui,sans-serif;
  --inc-body:"Instrument Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
  background:var(--inc-bg);color:var(--inc-ink);min-height:100vh;
  font-family:var(--inc-body);font-size:1.0625rem;line-height:1.55;-webkit-font-smoothing:antialiased;
}

/* Custom App Themes */
.incudorm[data-theme="midnight"]{
  --inc-bg:#0B0C1E; --inc-ink:#F1F0FF; --inc-muted:#9F9ED1; --inc-paper:#141530; --inc-line:#2D2F57;
  --inc-brand:#6366F1; --inc-sun:#FCD34D; --inc-mint:#34D399; --inc-lilac:#A78BFA; --inc-pop-ink:#0B0C1E;
  --inc-dot:#1D1F42; --inc-chip:#1F2148; --inc-ok:#34D399; --inc-err:#FB7185; --inc-link:#818CF8;
}

.incudorm[data-theme="cyber"]{
  --inc-bg:#06080F; --inc-ink:#E2FDF8; --inc-muted:#7FA6A0; --inc-paper:#0E131F; --inc-line:#1D2B3A;
  --inc-brand:#00E5FF; --inc-sun:#FFE600; --inc-mint:#00FF9D; --inc-lilac:#B388FF; --inc-pop-ink:#06080F;
  --inc-dot:#132030; --inc-chip:#142332; --inc-ok:#00FF9D; --inc-err:#FF3366; --inc-link:#00E5FF;
}

.incudorm[data-theme="sunset"]{
  --inc-bg:#FFF8F0; --inc-ink:#321A11; --inc-muted:#825848; --inc-paper:#FFFFFF; --inc-line:#FCD8BD;
  --inc-brand:#EA580C; --inc-sun:#F59E0B; --inc-mint:#10B981; --inc-lilac:#F472B6; --inc-pop-ink:#321A11;
  --inc-dot:#F7CFB2; --inc-chip:#FFEDD5; --inc-ok:#10B981; --inc-err:#EF4444; --inc-link:#C2410C;
}

.incudorm[data-theme="mint"]{
  --inc-bg:#F0FDF4; --inc-ink:#0F3323; --inc-muted:#487460; --inc-paper:#FFFFFF; --inc-line:#BBF7D0;
  --inc-brand:#059669; --inc-sun:#FBBF24; --inc-mint:#10B981; --inc-lilac:#A7F3D0; --inc-pop-ink:#0F3323;
  --inc-dot:#A7F3D0; --inc-chip:#DCFCE7; --inc-ok:#059669; --inc-err:#E11D48; --inc-link:#047857;
}

.incudorm[data-theme="lavender"]{
  --inc-bg:#FAF5FF; --inc-ink:#271439; --inc-muted:#6E5484; --inc-paper:#FFFFFF; --inc-line:#E9D5FF;
  --inc-brand:#9333EA; --inc-sun:#FDE047; --inc-mint:#6EE7B7; --inc-lilac:#C084FC; --inc-pop-ink:#271439;
  --inc-dot:#DDD6FE; --inc-chip:#F3E8FF; --inc-ok:#10B981; --inc-err:#F43F5E; --inc-link:#7E22CE;
}

@media (prefers-color-scheme:dark){
  .incudorm:not([data-theme]){
    --inc-bg:#0E0E26; --inc-ink:#F1F0FF; --inc-muted:#A8A7D2; --inc-paper:#1A1A44; --inc-line:#34346E;
    --inc-dot:#25254F; --inc-chip:#25255A; --inc-ok:#46E0A0; --inc-err:#FF8FA3; --inc-link:#9C9CFF;
  }
}
.incudorm *,.incudorm *::before,.incudorm *::after{box-sizing:border-box}
.incudorm h1,.incudorm h2,.incudorm h3{font-family:var(--inc-display);line-height:1.08;letter-spacing:-.025em;margin:0}
.incudorm a{color:inherit}
.incudorm :focus-visible{outline:3px solid var(--inc-brand);outline-offset:3px;border-radius:6px}
.incudorm .inc-wrap{width:min(1120px,100% - 2.5rem);margin-inline:auto}
.incudorm p{margin:0}

/* buttons */
.incudorm .inc-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:.5rem;
  font:600 1rem var(--inc-body);padding:.8rem 1.35rem;border-radius:999px;border:2px solid transparent;
  cursor:pointer;text-decoration:none;transition:transform .15s ease,background .15s ease,color .15s ease;
}
.incudorm .inc-btn:active{transform:translateY(1px)}
.incudorm .inc-btn:disabled{opacity:.6;cursor:not-allowed}
.incudorm .inc-btn-primary{background:var(--inc-brand);color:#fff}
.incudorm .inc-btn-primary:hover:not(:disabled){background:#2A2AEE}
.incudorm .inc-btn-ghost{background:transparent;color:var(--inc-ink);border-color:var(--inc-ink)}
.incudorm .inc-btn-ghost:hover:not(:disabled){background:var(--inc-chip)}
.incudorm .inc-btn-danger{background:transparent;color:var(--inc-err);border-color:var(--inc-err)}
.incudorm .inc-btn-danger:hover:not(:disabled){background:var(--inc-err);color:#fff}
.incudorm .inc-btn-mint{background:var(--inc-mint);color:var(--inc-pop-ink)}
.incudorm .inc-btn-small{padding:.5rem 1rem;font-size:.92rem}
.incudorm .inc-btn-block{width:100%}

/* shell */
.incudorm .inc-app-header{background:var(--inc-paper);border-bottom:2px solid var(--inc-ink)}
.incudorm .inc-app-bar{display:flex;align-items:center;gap:1.25rem;padding:.8rem 0;flex-wrap:wrap}
.incudorm .inc-logo{display:flex;align-items:center;gap:.55rem;font-family:var(--inc-display);font-weight:800;font-size:1.35rem;text-decoration:none;letter-spacing:-.03em}
.incudorm .inc-logo-mark{width:32px;height:32px;border-radius:10px;background:var(--inc-brand);display:grid;place-items:center}
.incudorm .inc-app-nav{display:flex;gap:.25rem;flex:1;min-width:0}
.incudorm .inc-app-link{
  text-decoration:none;font-weight:600;color:var(--inc-muted);padding:.45rem .9rem;border-radius:999px;
}
.incudorm .inc-app-link:hover{color:var(--inc-ink);background:var(--inc-chip)}
.incudorm .inc-app-link.active{background:var(--inc-ink);color:var(--inc-bg)}
.incudorm .inc-app-right{display:flex;align-items:center;gap:.6rem}
@media (max-width:760px){
  .incudorm .inc-app-nav{order:3;flex-basis:100%}
  .incudorm .inc-app-right{margin-left:auto}
}
.incudorm .inc-main{padding:2.25rem 0 4rem}
.incudorm .inc-page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:1.75rem}
.incudorm .inc-page-head h1{font-size:clamp(1.9rem,4vw,2.6rem);font-weight:800}
.incudorm .inc-page-head p{color:var(--inc-muted);margin-top:.4rem}

/* avatar, chips */
.incudorm .inc-avatar{
  flex:none;border-radius:50%;display:grid;place-items:center;border:2px solid var(--inc-ink);
  font:800 1rem var(--inc-display);color:var(--inc-pop-ink);background:var(--pop,var(--inc-sun));
}
.incudorm .inc-chips{display:flex;flex-wrap:wrap;gap:.35rem}
.incudorm .inc-chip{background:var(--inc-chip);border-radius:8px;padding:.2rem .6rem;font-size:.88rem;font-weight:500}
.incudorm .inc-chip.solid{background:var(--inc-ink);color:var(--inc-bg)}
.incudorm .inc-chip.sun{background:var(--inc-sun);color:var(--inc-pop-ink)}
.incudorm .inc-chip.mint{background:var(--inc-mint);color:var(--inc-pop-ink)}
.incudorm .inc-chip.err{background:var(--inc-err);color:#fff}
.incudorm .inc-muted{color:var(--inc-muted)}
.incudorm .inc-small{font-size:.92rem}
.incudorm .inc-link{color:var(--inc-link);font-weight:600;text-decoration:underline;text-underline-offset:3px}

/* forms */
.incudorm .inc-field{display:grid;gap:.4rem;margin-bottom:1.1rem}
.incudorm .inc-field > label,.incudorm .inc-label{font-weight:600;font-size:.95rem}
.incudorm .inc-hint{font-size:.88rem;color:var(--inc-muted)}
.incudorm .inc-input,.incudorm .inc-select,.incudorm .inc-textarea{
  width:100%;font:500 1rem var(--inc-body);color:var(--inc-ink);background:var(--inc-paper);
  border:2px solid var(--inc-line);border-radius:14px;padding:.75rem 1rem;
}
.incudorm .inc-textarea{resize:vertical;min-height:120px;line-height:1.5}
.incudorm .inc-input::placeholder,.incudorm .inc-textarea::placeholder{color:var(--inc-muted)}
.incudorm .inc-input:focus-visible,.incudorm .inc-select:focus-visible,.incudorm .inc-textarea:focus-visible{outline-offset:2px;border-color:var(--inc-brand)}
.incudorm .inc-row{display:grid;gap:1rem}
@media (min-width:640px){.incudorm .inc-row.two{grid-template-columns:1fr 1fr}.incudorm .inc-row.three{grid-template-columns:repeat(3,1fr)}}
.incudorm .inc-error{color:var(--inc-err);font-weight:600;font-size:.95rem}
.incudorm .inc-ok{color:var(--inc-ok);font-weight:600;font-size:.95rem}
.incudorm .inc-skillpick{display:grid;gap:.6rem}
.incudorm .inc-toggle{
  font:600 .92rem var(--inc-body);color:var(--inc-ink);background:transparent;border:2px solid var(--inc-line);
  border-radius:999px;padding:.35rem .85rem;cursor:pointer;transition:background .15s ease,border-color .15s ease;
}
.incudorm .inc-toggle:hover{border-color:var(--inc-ink)}
.incudorm .inc-toggle[aria-pressed="true"]{background:var(--inc-ink);color:var(--inc-bg);border-color:var(--inc-ink)}
.incudorm .inc-addskill{display:flex;gap:.5rem;max-width:380px}

/* color picker */
.incudorm .inc-colors{display:flex;gap:.6rem;flex-wrap:wrap}
.incudorm .inc-swatch{
  width:40px;height:40px;border-radius:50%;border:2px solid var(--inc-ink);display:grid;place-items:center;
  cursor:pointer;position:relative;background:var(--c);transition:transform .15s ease
}
.incudorm .inc-swatch:hover{transform:scale(1.1)}
.incudorm .inc-swatch input{position:absolute;opacity:0;width:100%;height:100%;cursor:pointer}
.incudorm .inc-swatch .tick{opacity:0;transition:opacity .15s ease}
.incudorm .inc-swatch:has(input:checked) .tick{opacity:1}

/* cards, grids */
.incudorm .inc-card{background:var(--inc-paper);border:2px solid var(--inc-line);border-radius:18px;padding:1.4rem}
.incudorm .inc-card.ink{border-color:var(--inc-ink);box-shadow:6px 6px 0 var(--inc-ink)}
.incudorm .inc-card h2,.incudorm .inc-card h3{margin-bottom:.75rem}
.incudorm .inc-grid{display:grid;gap:1.4rem;grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
.incudorm .inc-pcard{
  display:flex;flex-direction:column;background:var(--inc-paper);border:2px solid var(--inc-ink);border-radius:20px;overflow:hidden;
  text-decoration:none;color:inherit;box-shadow:5px 5px 0 var(--inc-ink);transform:rotate(var(--tilt,0deg));
  transition:transform .15s ease,box-shadow .15s ease;
}
.incudorm a.inc-pcard:hover{transform:translate(-2px,-2px) rotate(var(--tilt,0deg));box-shadow:8px 8px 0 var(--inc-ink)}
.incudorm .inc-pcard-top{background:var(--pop);color:var(--inc-pop-ink);padding:.65rem 1rem;font-weight:600;font-size:.9rem;display:flex;justify-content:space-between;align-items:center;gap:.5rem}
.incudorm .inc-card-share-btn{background:rgba(20,20,58,.08);border:none;color:var(--inc-pop-ink);border-radius:999px;width:24px;height:24px;display:grid;place-items:center;cursor:pointer;transition:background .15s ease,transform .15s ease}
.incudorm .inc-card-share-btn:hover{background:rgba(20,20,58,.2);transform:scale(1.1)}
.incudorm .inc-pcard-body{padding:1rem 1.1rem 1.1rem;display:flex;flex-direction:column;gap:.7rem;flex:1}
.incudorm .inc-pcard h3{font-size:1.35rem;margin:0}
.incudorm .inc-pcard .pitch{color:var(--inc-muted);font-size:.97rem;line-height:1.45;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.incudorm .inc-looking{font-size:.85rem;font-weight:600;margin-bottom:.3rem}
.incudorm .inc-pcard-foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:.6rem;font-size:.9rem;color:var(--inc-muted)}
.incudorm .inc-pcard-foot .who{display:flex;align-items:center;gap:.5rem;min-width:0}
.incudorm .inc-pcard-foot b{color:var(--inc-ink);font-weight:600;display:block;line-height:1.2}

/* Card Themes */
.incudorm .inc-pcard.inc-card-theme-brutalist{border-width:3.5px;box-shadow:7px 7px 0 var(--inc-ink)}
.incudorm a.inc-pcard.inc-card-theme-brutalist:hover{transform:translate(-3px,-3px) rotate(var(--tilt,0deg));box-shadow:10px 10px 0 var(--inc-ink)}
.incudorm .inc-pcard.inc-card-theme-brutalist .inc-pcard-top{border-bottom:3px solid var(--inc-ink);letter-spacing:.02em}

.incudorm .inc-pcard.inc-card-theme-gradient .inc-pcard-top{background:linear-gradient(135deg,var(--pop),#6366F1);color:#fff;border-bottom:2px solid var(--inc-ink)}
.incudorm .inc-pcard.inc-card-theme-gradient{box-shadow:0 4px 20px rgba(59,59,255,.14),5px 5px 0 var(--inc-ink)}

.incudorm .inc-pcard.inc-card-theme-pastel{background:color-mix(in srgb,var(--pop) 10%,var(--inc-paper));border-radius:24px}
.incudorm .inc-pcard.inc-card-theme-pastel .inc-pcard-top{background:color-mix(in srgb,var(--pop) 35%,var(--inc-paper));border-bottom:2px solid var(--inc-ink)}

.incudorm .inc-pcard.inc-card-theme-cyber{background:#0E1022;color:#EDF2F7;border-color:var(--pop);box-shadow:0 0 16px color-mix(in srgb,var(--pop) 30%,transparent),5px 5px 0 #000}
.incudorm .inc-pcard.inc-card-theme-cyber .inc-pcard-top{background:#171936;color:var(--pop);border-bottom:2px solid var(--pop)}
.incudorm .inc-pcard.inc-card-theme-cyber .pitch{color:#A0AEC0}

.incudorm .inc-pcard.inc-card-theme-editorial{border-radius:14px;background:var(--inc-paper)}
.incudorm .inc-pcard.inc-card-theme-editorial .inc-pcard-top{background:var(--inc-chip);border-bottom:2px dashed var(--inc-ink);color:var(--inc-ink)}

/* Visibility pills & tags */
.incudorm .inc-vis-pill{
  display:inline-flex;align-items:center;gap:.25rem;border-radius:999px;padding:.15rem .55rem;
  font-size:.76rem;font-weight:700;letter-spacing:.02em;text-transform:uppercase;border:1.5px solid currentColor;
}
.incudorm .inc-vis-pill.private{background:#2E1065;color:#DDD6FE;border-color:#7C3AED}
.incudorm .inc-vis-pill.campus{background:#FEF3C7;color:#92400E;border-color:#F59E0B}
.incudorm .inc-vis-pill.everyone{background:#DCFCE7;color:#166534;border-color:#22C55E}

/* Visibility feed tabs */
.incudorm .inc-vis-tabs{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.5rem;border-bottom:2px solid var(--inc-line);padding-bottom:.8rem}
.incudorm .inc-vis-tab{
  font:600 .95rem var(--inc-body);color:var(--inc-muted);background:var(--inc-paper);border:2px solid var(--inc-line);
  border-radius:999px;padding:.45rem 1rem;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;transition:all .15s ease;
}
.incudorm .inc-vis-tab:hover{color:var(--inc-ink);border-color:var(--inc-ink)}
.incudorm .inc-vis-tab.active{background:var(--inc-ink);color:var(--inc-bg);border-color:var(--inc-ink)}
.incudorm .inc-vis-tab .count{
  display:inline-grid;place-items:center;min-width:1.3rem;height:1.3rem;padding:0 .3rem;border-radius:999px;
  background:var(--inc-sun);color:var(--inc-pop-ink);font-size:.75rem;font-weight:800;
}
.incudorm .inc-vis-tab.active .count{background:var(--inc-bg);color:var(--inc-ink)}

/* Feed Sections */
.incudorm .inc-feed-sections{display:grid;gap:2.75rem}
.incudorm .inc-feed-section{display:grid;gap:1.35rem}
.incudorm .inc-feed-sec-head{display:flex;align-items:flex-end;justify-content:space-between;gap:1rem;flex-wrap:wrap;border-bottom:2px solid var(--inc-line);padding-bottom:.8rem}
.incudorm .inc-feed-sec-head .sec-title-wrap{display:flex;align-items:center;gap:.75rem}
.incudorm .inc-feed-sec-head .sec-icon{font-size:1.8rem;line-height:1}
.incudorm .inc-feed-sec-head h2{font-size:1.6rem;margin:0}
.incudorm .inc-feed-sec-head p{color:var(--inc-muted);font-size:.92rem;margin-top:.15rem}
.incudorm .inc-sec-tag{font:700 .82rem var(--inc-body);border-radius:999px;padding:.3rem .75rem;border:1.5px solid var(--inc-ink)}
.incudorm .inc-sec-tag.private{background:#2E1065;color:#E9D5FF;border-color:#7C3AED}
.incudorm .inc-sec-tag.campus{background:#FEF3C7;color:#92400E;border-color:#F59E0B}
.incudorm .inc-sec-tag.everyone{background:#DCFCE7;color:#166534;border-color:#22C55E}

.incudorm .inc-empty-sec{border:2px dashed var(--inc-line);border-radius:16px;padding:1.6rem;text-align:center;color:var(--inc-muted);display:flex;flex-direction:column;align-items:center;gap:.75rem}

/* Visibility Selector in Create Form */
.incudorm .inc-vis-selector{display:grid;gap:.8rem;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.incudorm .inc-vis-option{
  display:flex;gap:.8rem;align-items:flex-start;border:2px solid var(--inc-line);border-radius:14px;
  padding:.9rem 1rem;background:var(--inc-paper);cursor:pointer;position:relative;transition:all .15s ease;
}
.incudorm .inc-vis-option input{position:absolute;opacity:0}
.incudorm .inc-vis-option:hover{border-color:var(--inc-ink)}
.incudorm .inc-vis-option.selected{border-color:var(--inc-ink);background:var(--inc-chip);box-shadow:4px 4px 0 var(--inc-ink)}
.incudorm .inc-vis-option .vis-icon{font-size:1.6rem;line-height:1}
.incudorm .inc-vis-option .vis-info strong{display:block;font-size:1rem;margin-bottom:.2rem}
.incudorm .inc-vis-option .vis-info span{display:block;font-size:.84rem;color:var(--inc-muted);line-height:1.35}

/* Themes Grid in Create Form and Profile */
.incudorm .inc-themes-grid{display:grid;gap:.7rem;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
.incudorm .inc-theme-btn{
  border:2px solid var(--inc-line);border-radius:12px;padding:.75rem .9rem;background:var(--inc-paper);
  color:var(--inc-ink);text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:.2rem;transition:all .15s ease;
}
.incudorm .inc-theme-btn:hover{border-color:var(--inc-ink)}
.incudorm .inc-theme-btn.active{border-color:var(--inc-ink);background:var(--inc-chip);box-shadow:3px 3px 0 var(--inc-ink)}
.incudorm .inc-theme-btn .name{font-weight:700;font-size:.95rem}
.incudorm .inc-theme-btn .desc{font-size:.8rem;color:var(--inc-muted);line-height:1.3}

/* Quick theme selector in nav */
.incudorm .inc-theme-quick-select{font:600 .88rem var(--inc-body);color:var(--inc-ink);background:var(--inc-chip);border:2px solid var(--inc-line);border-radius:999px;padding:.35rem .75rem;cursor:pointer;outline:none}
.incudorm .inc-theme-quick-select:hover{border-color:var(--inc-ink)}
.incudorm .inc-tcard{display:flex;flex-direction:column;gap:.8rem;background:var(--inc-paper);border:2px solid var(--inc-line);border-left:8px solid var(--pop);border-radius:14px;padding:1.2rem}
.incudorm .inc-tcard .head{display:flex;gap:.8rem;align-items:center}
.incudorm .inc-tcard h3{font-size:1.2rem;margin:0}
.incudorm .inc-tcard .bio{color:var(--inc-muted);font-size:.97rem;line-height:1.45;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.incudorm .inc-tcard .actions{margin-top:auto;display:flex;gap:.5rem;flex-wrap:wrap}

.incudorm .inc-filters{display:flex;flex-wrap:wrap;gap:.7rem;align-items:center;margin-bottom:1.75rem}
.incudorm .inc-filters .inc-input{max-width:320px}
.incudorm .inc-filters .inc-select{width:auto;min-width:160px}

.incudorm .inc-empty{border:2px dashed var(--inc-line);border-radius:18px;padding:2.5rem 1.5rem;text-align:center;display:grid;gap:.5rem;justify-items:center}
.incudorm .inc-empty h3{font-size:1.4rem}
.incudorm .inc-empty p{color:var(--inc-muted);max-width:44ch}
.incudorm .inc-empty .acts{display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center;margin-top:.6rem}
.incudorm .inc-banner{background:var(--inc-sun);color:var(--inc-pop-ink);border:2px solid var(--inc-ink);border-radius:14px;padding:.9rem 1.1rem;font-weight:600;margin-bottom:1.5rem}

/* auth */
.incudorm .inc-auth{min-height:100vh;display:grid;place-items:center;padding:2rem 1.25rem;background-image:radial-gradient(var(--inc-dot) 1.4px,transparent 1.4px);background-size:26px 26px}
.incudorm .inc-auth-box{width:min(480px,100%)}
.incudorm .inc-auth-box .inc-logo{margin-bottom:1.5rem}
.incudorm .inc-tabs{display:flex;gap:.3rem;background:var(--inc-chip);padding:.3rem;border-radius:999px;margin-bottom:1.4rem}
.incudorm .inc-tab{flex:1;font:600 .98rem var(--inc-body);border:0;background:transparent;color:var(--inc-muted);padding:.55rem;border-radius:999px;cursor:pointer}
.incudorm .inc-tab[aria-selected="true"]{background:var(--inc-ink);color:var(--inc-bg)}
.incudorm .inc-auth-box h1{font-size:1.9rem;font-weight:800;margin-bottom:.35rem}

/* detail */
.incudorm .inc-detail{display:grid;gap:2rem}
@media (min-width:960px){.incudorm .inc-detail{grid-template-columns:1fr 350px;align-items:start}}
.incudorm .inc-detail h1{font-size:clamp(2rem,4.4vw,3rem);font-weight:800}
.incudorm .inc-pitchline{font-size:1.25rem;color:var(--inc-muted);margin:.7rem 0 1.1rem;max-width:56ch}
.incudorm .inc-stack{display:grid;gap:1.4rem}
.incudorm .inc-desc{white-space:pre-wrap;line-height:1.65;max-width:68ch}
.incudorm .inc-role{border-left:8px solid var(--pop);background:var(--inc-paper);border-radius:12px;padding:.9rem 1.1rem;display:grid;gap:.5rem;border-top:2px solid var(--inc-line);border-right:2px solid var(--inc-line);border-bottom:2px solid var(--inc-line)}
.incudorm .inc-role h3{font-size:1.15rem;margin:0}
.incudorm .inc-radio{display:flex;gap:.6rem;align-items:flex-start;padding:.6rem .8rem;border:2px solid var(--inc-line);border-radius:12px;cursor:pointer}
.incudorm .inc-radio:has(input:checked){border-color:var(--inc-brand);background:var(--inc-chip)}
.incudorm .inc-radio input{margin-top:.3rem;accent-color:var(--inc-brand)}
.incudorm .inc-applicant{display:grid;gap:.6rem;padding:1rem 0;border-top:2px solid var(--inc-line)}
.incudorm .inc-applicant:first-of-type{border-top:0;padding-top:0}
.incudorm .inc-applicant .top{display:flex;gap:.7rem;align-items:center;justify-content:space-between;flex-wrap:wrap}
.incudorm .inc-applicant .person{display:flex;gap:.7rem;align-items:center}
.incudorm .inc-applicant .msg{white-space:pre-wrap;background:var(--inc-chip);border-radius:12px;padding:.7rem .9rem}
.incudorm .inc-applicant .acts{display:flex;gap:.5rem;flex-wrap:wrap}
.incudorm .inc-member{display:flex;gap:.7rem;align-items:center;text-decoration:none;padding:.4rem 0}
.incudorm .inc-member b{display:block;line-height:1.2}

/* create */
.incudorm .inc-create{display:grid;gap:2.25rem}
@media (min-width:1000px){.incudorm .inc-create{grid-template-columns:1fr 360px;align-items:start}.incudorm .inc-sticky{position:sticky;top:1.5rem}}
.incudorm .inc-roleedit{border:2px solid var(--inc-line);border-radius:14px;padding:1rem;margin-bottom:1rem;display:grid;gap:.8rem;background:var(--inc-paper)}
.incudorm .inc-roleedit header{display:flex;justify-content:space-between;align-items:center;gap:.5rem}

/* profile */
.incudorm .inc-profile-head{display:grid;gap:1.4rem}
@media (min-width:760px){.incudorm .inc-profile-head{grid-template-columns:auto 1fr;align-items:start}}
.incudorm .inc-profile-head h1{font-size:clamp(1.9rem,4vw,2.6rem);font-weight:800}
.incudorm .inc-portfolio{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
.incudorm .inc-pf{border:2px solid var(--inc-line);border-top:6px solid var(--pop);border-radius:12px;padding:1rem;display:grid;gap:.4rem;background:var(--inc-paper)}
.incudorm .inc-pf h3{font-size:1.1rem;margin:0}
.incudorm .inc-section{margin-top:2.5rem}
.incudorm .inc-section > h2{font-size:1.6rem;margin-bottom:1rem}

/* messages */
.incudorm .inc-chat{display:grid;border:2px solid var(--inc-ink);border-radius:20px;overflow:hidden;background:var(--inc-paper);height:min(680px,calc(100vh - 190px));min-height:520px}
@media (min-width:820px){.incudorm .inc-chat{grid-template-columns:320px 1fr}}
@media (max-width:819px){
  .incudorm .inc-chat.has-thread .inc-threads{display:none}
  .incudorm .inc-chat:not(.has-thread) .inc-convo{display:none}
}
.incudorm .inc-threads{border-right:2px solid var(--inc-line);overflow-y:auto;display:flex;flex-direction:column}
.incudorm .inc-threads h2{font-size:1.1rem;padding:1rem 1.1rem;border-bottom:2px solid var(--inc-line);margin:0}
.incudorm .inc-thread{display:flex;gap:.7rem;align-items:center;padding:.85rem 1.1rem;text-decoration:none;border-bottom:2px solid var(--inc-line)}
.incudorm .inc-thread:hover{background:var(--inc-chip)}
.incudorm .inc-thread.active{background:var(--inc-chip);box-shadow:inset 6px 0 0 var(--inc-brand)}
.incudorm .inc-thread .t{min-width:0}
.incudorm .inc-thread b{display:block;line-height:1.25}
.incudorm .inc-thread span{display:block;font-size:.88rem;color:var(--inc-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.incudorm .inc-convo{display:flex;flex-direction:column;min-width:0;min-height:0}
.incudorm .inc-convo-head{display:flex;gap:.8rem;align-items:center;padding:.85rem 1.1rem;border-bottom:2px solid var(--inc-line)}
.incudorm .inc-convo-head .t{min-width:0;flex:1}
.incudorm .inc-convo-head b{display:block;line-height:1.2}
.incudorm .inc-msgs{flex:1;overflow-y:auto;padding:1.1rem;display:flex;flex-direction:column;gap:.55rem}
.incudorm .inc-bubble{max-width:min(78%,520px);padding:.6rem .9rem;border-radius:16px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.45}
.incudorm .inc-bubble.me{align-self:flex-end;background:var(--inc-brand);color:#fff;border-bottom-right-radius:4px}
.incudorm .inc-bubble.them{align-self:flex-start;background:var(--inc-chip);border-bottom-left-radius:4px}
.incudorm .inc-bubble time{display:block;font-size:.75rem;opacity:.75;margin-top:.15rem}
.incudorm .inc-sys{align-self:center;background:var(--inc-sun);color:var(--inc-pop-ink);border-radius:999px;padding:.3rem .9rem;font-size:.88rem;font-weight:600;text-align:center}
.incudorm .inc-composer{display:flex;gap:.6rem;padding:.8rem;border-top:2px solid var(--inc-line);align-items:flex-end}
.incudorm .inc-composer .inc-textarea{min-height:46px;max-height:140px;padding:.6rem .9rem;border-radius:16px}
.incudorm .inc-convo-empty{margin:auto;padding:2rem;text-align:center;color:var(--inc-muted)}
.incudorm .inc-back{display:none}
@media (max-width:819px){.incudorm .inc-back{display:inline-flex}}

/* footer */
.incudorm .inc-footer{padding:2rem 0 2.5rem;color:var(--inc-muted);font-size:.95rem;border-top:2px solid var(--inc-ink)}
.incudorm .inc-footer-row{display:flex;flex-wrap:wrap;justify-content:space-between;gap:1rem}
.incudorm .inc-footer-links{display:flex;gap:1.25rem;flex-wrap:wrap}
.incudorm .inc-footer-links a{color:var(--inc-muted)}
.incudorm .inc-footer-links a:hover{color:var(--inc-ink)}

/* count badge on nav items */
.incudorm .inc-count{display:inline-grid;place-items:center;min-width:1.35rem;height:1.35rem;padding:0 .35rem;margin-left:.4rem;border-radius:999px;background:var(--inc-sun);color:var(--inc-pop-ink);font-size:.78rem;font-weight:800}

/* dashboard */
.incudorm .inc-subnav{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1.75rem;border-bottom:2px solid var(--inc-line);padding-bottom:.8rem}
.incudorm .inc-subtab{text-decoration:none;font-weight:600;color:var(--inc-muted);padding:.45rem 1rem;border-radius:999px;display:inline-flex;align-items:center}
.incudorm .inc-subtab:hover{color:var(--inc-ink);background:var(--inc-chip)}
.incudorm .inc-subtab.active{background:var(--inc-ink);color:var(--inc-bg)}
.incudorm .inc-stats{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
.incudorm .inc-stat{background:var(--inc-paper);border:2px solid var(--inc-ink);border-radius:16px;padding:1rem 1.2rem;box-shadow:4px 4px 0 var(--inc-ink);display:grid;gap:.1rem}
.incudorm .inc-stat b{font:800 2rem var(--inc-display);line-height:1}
.incudorm .inc-stat span{color:var(--inc-muted);font-size:.92rem}

/* onboarding progress */
.incudorm .inc-progress{height:10px;background:var(--inc-chip);border:2px solid var(--inc-ink);border-radius:999px;overflow:hidden;margin:.5rem 0 1.6rem}
.incudorm .inc-progress span{display:block;height:100%;background:var(--inc-brand);transition:width .25s ease}

/* modal */
.incudorm .inc-modal{padding:0;border:2px solid var(--inc-ink);border-radius:20px;width:min(560px,calc(100% - 2rem));max-height:calc(100vh - 2rem);background:var(--inc-paper);color:var(--inc-ink);box-shadow:8px 8px 0 var(--inc-ink);font-family:var(--inc-body)}
.incudorm .inc-modal::backdrop{background:rgba(20,20,58,.6)}
.incudorm .inc-modal-body{padding:1.4rem}
.incudorm .inc-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1.2rem}
.incudorm .inc-modal-head h2{font-size:1.5rem}

/* legal pages */
.incudorm .inc-legal{max-width:760px}
.incudorm .inc-legal h1{font-size:clamp(2rem,4.4vw,3rem);font-weight:800;margin-bottom:.5rem}
.incudorm .inc-legal h2{font-size:1.4rem;margin:2.2rem 0 .6rem}
.incudorm .inc-legal p{margin:.7rem 0;line-height:1.65}
.incudorm .inc-legal ul{margin:.7rem 0;padding-left:1.3rem;display:grid;gap:.45rem;line-height:1.6}

@media (prefers-reduced-motion:reduce){
  .incudorm .inc-btn,.incudorm .inc-toggle,.incudorm .inc-pcard,.incudorm .inc-progress span{transition:none}
}
`;
