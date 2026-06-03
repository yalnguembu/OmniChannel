import { CHANNELS, KPI_STATS } from "../_data";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/* ─── Octopus SVG (extracted for readability) ─── */
function OctopusSvg() {
  return (
    <svg className="w-full h-full" viewBox="0 0 480 480" fill="none">
      <defs>
        <radialGradient id="hg" cx="50%" cy="40%" r="55%">
          <stop offset="0%"   stopColor="#2E8FAD" />
          <stop offset="100%" stopColor="#0D2137" />
        </radialGradient>
        <linearGradient id="tg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#2E8FAD" stopOpacity=".9"  />
          <stop offset="100%" stopColor="#0D2137" stopOpacity=".25" />
        </linearGradient>
        <linearGradient id="tg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#E8541A" stopOpacity=".75" />
          <stop offset="100%" stopColor="#1B5E82" stopOpacity=".2"  />
        </linearGradient>
      </defs>
      {/* Tentacles */}
      <path d="M212 238 C182 208 118 176 78 118 C73 110 76 98 88 96 C100 94 106 103 104 113 C113 106 126 108 130 120 C134 132 126 142 116 143 C133 150 163 166 193 198" stroke="url(#tg1)" strokeWidth="15" strokeLinecap="round" fill="none" opacity=".88" />
      <path d="M268 238 C298 208 362 176 402 118 C407 110 404 98 392 96 C380 94 374 103 376 113 C367 106 354 108 350 120 C346 132 354 142 364 143 C347 150 317 166 287 198" stroke="url(#tg1)" strokeWidth="15" strokeLinecap="round" fill="none" opacity=".88" />
      <path d="M278 268 C320 258 378 246 418 206 C426 198 425 186 415 182 C405 178 397 186 400 196 C390 190 378 194 376 206 C374 218 384 226 394 224 C376 237 346 248 306 256" stroke="url(#tg2)" strokeWidth="13" strokeLinecap="round" fill="none" opacity=".82" />
      <path d="M202 268 C160 258 102 246 62 206 C54 198 55 186 65 182 C75 178 83 186 80 196 C90 190 102 194 104 206 C106 218 96 226 86 224 C104 237 134 248 174 256" stroke="url(#tg1)" strokeWidth="13" strokeLinecap="round" fill="none" opacity=".82" />
      <path d="M268 288 C298 320 338 368 358 398 C364 408 360 420 348 422 C336 424 328 414 332 404 C320 412 308 408 306 396 C304 384 314 376 324 378 C308 368 283 346 263 316" stroke="url(#tg1)" strokeWidth="12" strokeLinecap="round" fill="none" opacity=".78" />
      <path d="M212 288 C182 320 142 368 122 398 C116 408 120 420 132 422 C144 424 152 414 148 404 C160 412 172 408 174 396 C176 384 166 376 156 378 C172 368 197 346 217 316" stroke="url(#tg2)" strokeWidth="12" strokeLinecap="round" fill="none" opacity=".78" />
      <path d="M230 294 C222 338 212 378 192 413 C188 422 178 426 170 420 C162 414 164 404 172 400 C162 404 152 398 154 386 C156 374 168 370 176 374 C164 358 170 328 180 300" stroke="url(#tg2)" strokeWidth="11" strokeLinecap="round" fill="none" opacity=".72" />
      <path d="M250 294 C258 338 268 378 288 413 C292 422 302 426 310 420 C318 414 316 404 308 400 C318 404 328 398 326 386 C324 374 312 370 304 374 C316 358 310 328 300 300" stroke="url(#tg1)" strokeWidth="11" strokeLinecap="round" fill="none" opacity=".72" />
      {/* Tip dots */}
      <circle cx="114" cy="142" r="5.5" fill="#E8541A" opacity=".9"  />
      <circle cx="366" cy="142" r="5.5" fill="#E8541A" opacity=".9"  />
      <circle cx="394" cy="224" r="5"   fill="#6AB8D4" opacity=".9"  />
      <circle cx="86"  cy="224" r="5"   fill="#6AB8D4" opacity=".9"  />
      <circle cx="324" cy="378" r="4.5" fill="#E8541A" opacity=".82" />
      <circle cx="156" cy="378" r="4.5" fill="#E8541A" opacity=".82" />
      {/* Head */}
      <ellipse cx="240" cy="208" rx="90" ry="74" fill="url(#hg)" />
      <ellipse cx="224" cy="186" rx="32" ry="22" fill="rgba(255,255,255,.06)" />
      {/* Eyes */}
      <circle cx="210" cy="204" r="17" fill="#0D2137" />
      <circle cx="270" cy="204" r="17" fill="#0D2137" />
      <circle cx="210" cy="204" r="10" fill="#E8F4F8" />
      <circle cx="270" cy="204" r="10" fill="#E8F4F8" />
      <circle cx="213" cy="201" r="6"  fill="#2E8FAD" />
      <circle cx="273" cy="201" r="6"  fill="#2E8FAD" />
      <circle cx="212" cy="203" r="3.5" fill="#0D2137" />
      <circle cx="272" cy="203" r="3.5" fill="#0D2137" />
      <circle cx="215" cy="200" r="2"  fill="#fff" />
      <circle cx="275" cy="200" r="2"  fill="#fff" />
      {/* Smile */}
      <path d="M222 222 Q240 235 258 222" stroke="rgba(255,255,255,.35)" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Sparkle dots */}
      <circle cx="150" cy="166" r="3.5" fill="rgba(255,255,255,.18)" />
      <circle cx="170" cy="183" r="3"   fill="rgba(255,255,255,.13)" />
      <circle cx="330" cy="166" r="3.5" fill="rgba(255,255,255,.18)" />
      <circle cx="310" cy="183" r="3"   fill="rgba(255,255,255,.13)" />
      <circle cx="382" cy="242" r="3.5" fill="rgba(255,255,255,.18)" />
      <circle cx="98"  cy="242" r="3.5" fill="rgba(255,255,255,.18)" />
      <circle cx="292" cy="312" r="3"   fill="rgba(255,255,255,.13)" />
      <circle cx="188" cy="312" r="3"   fill="rgba(255,255,255,.13)" />
      {/* Orbit rings */}
      <circle cx="240" cy="208" r="108" stroke="#2E8FAD" strokeWidth=".5" strokeDasharray="4 7"  opacity=".22" />
      <circle cx="240" cy="208" r="134" stroke="#1B5E82" strokeWidth=".5" strokeDasharray="2 9"  opacity=".12" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="hero-bg min-h-screen flex items-center pt-[68px] relative overflow-hidden">
      <div className="hero-glow absolute inset-0 pointer-events-none" />

      <div className="w-full max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        {/* Left text */}
        <div className="order-2 lg:order-1">
          <div className="hero-d0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#6AB8D4] bg-[#E8F4F8] text-[11px] sm:text-xs font-medium text-[#1B5E82] mb-5 sm:mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 animate-bdot" />
            Plateforme omnicanale · Made in Africa
          </div>

          <h1 className="hero-d1 font-display text-[clamp(2.2rem,6vw,4rem)] font-semibold text-[#0D2137] leading-[1.1] tracking-[-0.025em] mb-5">
            Connectez vos clients
            <em className="not-italic font-normal text-accent block">
              à toute la pieuvre.
            </em>
          </h1>

          <p className="hero-d2 font-body text-base sm:text-[1.0625rem] font-light text-[#4A7A94] leading-relaxed max-w-[460px] mb-8 sm:mb-9">
            SMS, Email, WhatsApp et bien plus — orchestrés depuis une seule
            plateforme intelligente. Moins d'outils, plus d'impact.
          </p>

          <div className="hero-d3 flex flex-col md:flex-row items-stretch xs:items-center gap-3 mb-10 sm:mb-12">
            <button
              onClick={() => scrollTo("cta")}
              className="font-body text-sm sm:text-[14px] font-medium px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-accent text-white border-0 cursor-pointer btn-accent-shadow hover:bg-accent-hover hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Demander un accès
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => scrollTo("features")}
              className="font-body text-sm sm:text-[14px] font-normal px-6 sm:px-6 py-3 sm:py-3.5 rounded-full bg-transparent text-[#0D2137] border border-[#0D2137] cursor-pointer hover:bg-[#0D2137]/5 transition-all duration-200 text-center"
            >
              Découvrir les fonctionnalités
            </button>
          </div>

          {/* KPIs */}
          <div className="hero-d4 flex items-center gap-5 sm:gap-7">
            {KPI_STATS.map(([val, lbl], i) => (
              <div key={val} className="flex items-center gap-5 sm:gap-7">
                {i > 0 && <div className="w-px h-8 bg-[#DDE4EA]" />}
                <div>
                  <div className="font-display text-lg sm:text-[1.35rem] font-bold text-[#0D2137] tracking-[-0.02em]">
                    {val}
                  </div>
                  <div className="font-body text-[10px] sm:text-[11px] text-text-300 mt-0.5">
                    {lbl}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right visual */}
        <div className="order-1 lg:order-2 hero-visual flex justify-center items-center">
          <div className="animate-float relative w-70 h-70 sm:w-90 sm:h-90 md:w-105 md:h-105 lg:w-120 lg:h-120">
            {/* Channel pills — md+ only */}
            <div className="hidden md:block">
              {CHANNELS.map((ch) => (
                <div
                  key={ch.label}
                  className={`absolute ${ch.pos} inline-flex items-center gap-[7px] px-3 py-2 rounded-full bg-white border border-[#DDE4EA] text-[11px] lg:text-xs font-medium text-[#0D2137] shadow-sm whitespace-nowrap`}
                >
                  <span
                    className="w-[7px] h-[7px] rounded-full shrink-0"
                    style={{ background: ch.color }}
                  />
                  {ch.label}
                </div>
              ))}
            </div>
            <OctopusSvg />
          </div>
        </div>
      </div>
    </section>
  );
}
