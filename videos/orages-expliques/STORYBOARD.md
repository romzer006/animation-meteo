---
format: 1080x1920
duration: 75s
message: "Un orage, c'est de l'air chaud et humide qui monte comme une fusée — et selon sa structure, il va du simple orage d'été à la supercellule dévastatrice."
arc: concept-explainer with listicle
audience: grand public francophone sur TikTok (compte météo / climat)
mode: autonomous
music: dark cinematic storm pulse, driving percussion, tense
---

## Video direction

- **Palette (frame.md, Broadside):** two registers only, one per frame. DARK register = ink-black ground `#111111`, cream `#F0ECE5` text/shapes, fire-orange `#E85D26` as the single accent (the lightning, the heat, the key number, the warning). ORANGE register = fire-orange ground, ink-black type and shapes, ink overlays (75/55/40/20%) as muted tones — used for the declarative punches only: Frame 2 (the question), Frame 9 (the king: supercell), Frame 11 (CTA). Clouds are FLAT shapes (merged circles / rounded silhouettes drawn as one SVG path) in cream (dark register) or ink (orange register); never gradients, never shadows. The weather is drawn like a protest poster: big flat silhouettes + 1px hairlines + mono labels.
- **Type:** Barlow lowercase 900 negative-tracked for every hero word (display / h1 / h2 per fit-to-measure, ≤78cqw); IBM Plex Mono uppercase 0.14em for chrome (kickers, axis ticks, legend, counters like "TYPE 2 / 4"). Visible copy is short labels and hero words, never the narration sentence.
- **Motion grammar + reveal model:** long-tail `power3` / `expo.out` settles, no bounce. Every piece reveals on the word that names it (timings below are the real word timings). Lightning is the only "violent" move: an `svg-path-draw` strike in ≤0.2s plus a one-shot full-frame flash that decays — that flash is the video's punctuation and appears in Frames 1, 5 and 9 only. During holds: stillness or a subtle low-amplitude jitter; live SVG internals (rain streaks falling, a spiral rotating) are allowed as finite tweens.
- **Rhythm / held frames:** high tempo throughout (TikTok). Breathers are the last ~0.6s of Frame 4 (the cumulonimbus lands and holds) and the last ~1.2s of Frame 10 (200+ km/h holds). Frames 6→7→8→9 are one listicle on a consistent stage: the mono counter "TYPE n / 4" + four nav dots stay top-left at the same position in all four frames.
- **Layout (portrait 1080×1920):** heroes anchored high (title zone y≈180–520), the diagram/visual fills the middle (y≈520–1560). Nothing load-bearing below y=1600 — the karaoke caption pill owns the bottom band. ≥3 depth layers per frame: hairline grid/axis or rain field (background, 30–50% dim), the diagram (midground), hero word + labels (foreground).
- **Negative list:** no gradients, no drop shadows, no rounded cards (0 radius; only the nav dots are circles), no second accent color, no stock bokeh / purple-blue AI glow, no uppercase Barlow, no narration sentences on screen. Both motion failure modes are banned: slideshow (everything dumped at t=0 then frozen) and screensaver (many elements floating independently). No repeat/yoyo, no Math.random — deterministic index-based variation only.

## Frame 1 — 30 000 degrés

- scene: Écran noir, un éclair orange déchire l'écran avec un flash ; « 30 000 °c » compte à toute vitesse ; « ×5 » ; deux barres comparent l'éclair et la surface du Soleil.
- voiceover: "Un éclair chauffe l'air à trente mille degrés. Cinq fois plus que la surface du Soleil !"
- duration: 4.765s
- transition_in: cut
- status: animated
- src: compositions/frames/01-hook.html
- type: hook
- persuasion: Shocking statistic + Anchoring on a familiar referent (le Soleil)
- beat: Surprise + intrigue
- blueprint: dataviz-countup (Adapt)
- focal: the count-up number "30 000 °c"
- roles: lightning bolt = foreground subject (orange jagged SVG, top→center) · flash layer = supporting (one-shot cream full-frame flash) · count-up "30 000" + orange "°c" = foreground subject · "×5" = supporting accent · two comparison bars (éclair full / soleil 1/5) with mono labels = supporting · faint vertical rain hairlines = background (dim 30%)

narrativeRole: Ouvre la boucle de curiosité avec un chiffre choc, ancré sur une référence que tout le monde connaît.
keyMessage: Un orage, c'est une machine d'une puissance folle.

Adapt: keep the cold-open "one exploding statistic" signature (value-scaled counter landing big); the icon burst becomes a lightning strike + flash; the stat grid becomes two comparison bars.
Scene 1 (0.0–0.5s): ink-black field with faint diagonal rain hairlines (dim). An orange jagged lightning bolt strikes from the top edge down to y≈700 via **SVG self-draw** (`svg-path-draw`, ≤0.2s) and a cream full-frame flash fires and decays (one-shot). Layered depth, bolt centered.
Scene 2 (0.9–2.3s): on "trente mille", a **value-scaled counter** (`counting-dynamic-scale`) counts 0 → 30 000 in Barlow display 900 cream, centered at y≈620, growing as it climbs; orange "°c" lands beside it on "degrés" (1.6s). Mono kicker "TEMPÉRATURE D'UN ÉCLAIR" above (y≈420). The bolt dims to 40% behind.
Scene 3 (2.5–3.3s): on "cinq fois", an orange "×5" stamps in under the number (`spring-pop-entrance`, smooth long-tail settle, no overshoot), y≈880.
Scene 4 (3.3–4.77s): on "surface du Soleil", two horizontal **bars** (`stat-bars-and-fills`) fill from the left at y≈1100 and y≈1260: "ÉCLAIR" bar fills full width in orange, "SOLEIL" bar fills only one fifth in cream, each with a mono label; a small flat cream disc (the Sun) sits at the end of the short bar. Hold, at most subtle jitter on the number.

## Frame 2 — La question

- scene: Fond orange. Deux questions claquent en typo géante : « comment ça naît ? » puis « et en france ? » avec la silhouette de la France qui s'imprime ; « on décode tout ».
- voiceover: "Mais comment naît un orage ? Et lesquels peuvent frapper la France ? On décode tout."
- duration: 4.104s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/02-question.html
- type: pain_point
- persuasion: Question→answer pairing + Signposting
- beat: Curiosity + anticipation
- blueprint: compose
- focal: the giant question line
- roles: question lines (Barlow h1 lowercase, ink) = foreground subject · France silhouette (ink, filled, built from assets/france-path.txt) = foreground subject in Scene 2 · mono label "ON DÉCODE TOUT" = supporting · two 1px ink hairlines top/bottom = background chrome

narrativeRole: Pose les deux questions auxquelles la vidéo répond, pour promettre la récompense et retenir jusqu'au bout.
keyMessage: Tu vas comprendre la naissance d'un orage et savoir lesquels existent en France.

Compose (kinetic statement build on the ORANGE register; the payoff beat is a non-text element — the France silhouette).
Scene 1 (0.0–1.4s): fire-orange field; "comment" / "ça naît" / "?" build word-by-word (`dynamic-content-sequencing`, per-word staggered reveal) as Barlow h1 ink, left-anchored at y≈420–700; the "?" is display-size.
Scene 2 (1.4–3.1s): velocity-matched cut (cut-catalog: cut-the-curve upward) — the first question slides up and out while "et en france ?" rises in at y≈300; on "France" (2.6s) the filled ink France silhouette prints in at center (y≈700–1350, ~80% width) via a fast scale-from-0.92 + opacity settle (`spring-pop-entrance`, smooth).
Scene 3 (3.1–4.1s): on "on décode tout", a mono label "ON DÉCODE TOUT ▸" types on beneath the map (`discrete-text-sequence`, type-on) at y≈1450 and holds.

## Frame 3 — Les 3 ingrédients

- scene: La recette en 3 cartes empilées qui tombent une par une : goutte « humidité », chaud en bas / froid en haut « instabilité », coup de pouce « déclencheur » (relief, front, soleil).
- voiceover: "Il faut trois ingrédients. De l'humidité. De l'air chaud en bas, de l'air froid en haut. Et un coup de pouce : un relief, un front, ou le soleil."
- duration: 7.24s
- transition_in: push-slide UP
- status: animated
- src: compositions/frames/03-ingredients.html
- type: product_intro
- persuasion: Rule of three + Frame-then-fill
- beat: Clarity + orientation
- blueprint: grid-card-assemble (Adapt)
- focal: the three stacked ingredient cards
- roles: title "3 ingrédients" (the "3" in orange) = foreground subject · three top-border-only stat-cards (Broadside stat-card) stacked vertically = foreground subject · per-card flat icons (orange drop; orange up-arrow under a cream down-arrow; mountain triangle / front line / sun disc) = supporting · mono numbering 01/02/03 = supporting · hairline grid = background (dim 30%)

narrativeRole: Nomme la recette de base de tout orage en trois éléments simples à retenir.
keyMessage: Humidité + air instable + déclencheur = orage possible.

Adapt: keep the staggered self-assembling vertical list (signature: items assemble in a cascade, each on its cue); cards stack vertically for portrait.
Scene 1 (0.0–1.4s): ink-black field + faint hairline grid. Mono kicker "LA RECETTE" then h1 "3 ingrédients" per-word (`dynamic-content-sequencing`) at y≈200–420; the "3" is fire-orange.
Scene 2 (1.4–2.2s): on "humidité", card 01 slides up into place at y≈560–820 (top-border-only card): orange drop icon left, h2 "humidité" right.
Scene 3 (2.2–4.2s): on "chaud en bas" card 02 lands at y≈860–1120: an orange up-arrow block labeled mono "CHAUD" at its bottom (2.5s), then a cream down-arrow labeled "FROID" at its top (3.5s); h2 "instabilité".
Scene 4 (4.3–7.24s): on "coup de pouce" card 03 lands at y≈1160–1500: h2 "déclencheur"; three mono chips with tiny flat icons reveal on their words — "RELIEF" (triangle, 5.2s), "FRONT" (hairline with teeth, 5.8s), "SOLEIL" (disc, 6.5s). Hold still.

## Frame 4 — La tour de nuage

- scene: Coupe du ciel : une bulle d'air chaud orange monte comme une montgolfière, le cumulus gonfle puis explose en tour jusqu'à 10 km, l'enclume s'étale : « cumulonimbus ».
- voiceover: "L'air chaud monte comme une montgolfière. Il refroidit, sa vapeur se condense, et le nuage explose vers le ciel : plus de dix kilomètres de haut ! C'est le cumulonimbus."
- duration: 8.968s
- transition_in: push-slide UP
- status: outline
- src: compositions/frames/04-cumulonimbus.html
- type: feature_showcase
- persuasion: Analogy (montgolfière) + Demonstration + Causal chain
- beat: Fascination + "aha"
- blueprint: compose
- focal: the growing cloud tower (cumulonimbus)
- roles: ground hairline + left altitude axis with mono ticks 0 / 5 / 10 KM = background · orange hot-air bubble (circle + tiny basket, a balloon) = foreground subject Scene 1–2 · cream cumulus → cumulonimbus flat silhouette (tower + anvil) = foreground subject · altitude counter "10+ KM" (orange) = supporting · word "cumulonimbus" h2 = foreground label

narrativeRole: Montre le moteur de l'orage : l'ascendance d'air chaud qui construit une tour de nuage géante.
keyMessage: L'orage est un nuage-tour, le cumulonimbus, nourri par de l'air chaud qui monte.

Scene 1 (0.0–2.0s): ink-black field; ground hairline at y≈1540; left altitude axis (hairline + mono ticks "0 KM", "5 KM", "10 KM" at y≈1540 / 1000 / 460). An orange balloon (circle + small basket) rises from the ground to y≈1150 on "monte comme une montgolfière" with a smooth long-tail ease; mono label "AIR CHAUD" rides beside it.
Scene 2 (2.0–4.2s): on "refroidit" the balloon's fill softens from orange to a cream outline (one tween); on "condense" (3.7s) small flat cream puffs pop around it and merge into a cumulus (`center-outward-expansion`), centered x≈600.
Scene 3 (4.2–7.4s): on "explose vers le ciel" the cumulus grows into a tall flat tower (scaleY from its base, `power3`) up to y≈470; simultaneously an altitude marker climbs the axis and a mono/display counter counts 0 → 10 KM (`counting-dynamic-scale`), landing "10+ km" in orange on "dix kilomètres" (6.6s).
Scene 4 (7.4–8.97s): on "cumulonimbus" the anvil spreads flat at the top (scaleX), and h2 "cumulonimbus" lands upper-right (y≈260); hold still (breather).

## Frame 5 — L'électricité

- scene: Zoom dans le haut du nuage : grêlons et cristaux s'entrechoquent, les « + » montent, les « – » descendent, la tension monte… l'éclair frappe, flash, ondes du tonnerre.
- voiceover: "Au sommet, grêlons et cristaux de glace s'entrechoquent. Ça sépare les charges électriques… et boum ! L'éclair, puis le tonnerre."
- duration: 6.771s
- transition_in: zoom-through
- status: outline
- src: compositions/frames/05-eclair.html
- type: feature_showcase
- persuasion: Causal chain (collision → charges → décharge) + Callback (éclair du hook)
- beat: Tension → release
- blueprint: compose
- focal: the lightning strike
- roles: cloud interior (big flat cream-hint silhouette filling the top 60%) = background · hailstones (cream circles) + ice crystals (cream six-point stars) = foreground subjects Scene 1 · orange "+" signs (top) and cream "–" signs (bottom) = foreground subjects Scene 2 · mono "TENSION" bar = supporting · orange lightning bolt + cream flash = foreground subject Scene 3 · concentric sound arcs + labels "éclair" / "tonnerre" = supporting

narrativeRole: Explique d'où viennent l'éclair et le tonnerre, en bouclant avec l'image du hook.
keyMessage: Les collisions de glace chargent le nuage ; l'éclair est la décharge, le tonnerre son explosion sonore.

Scene 1 (0.0–2.9s): ink-black field with a large flat cloud-interior shape (cream at ~12% opacity) filling y≈150–1100. On "grêlons" (0.6s) eight cream hailstone circles appear; on "cristaux" (1.1s) eight cream ice-crystal stars appear (staggered by index); on "s'entrechoquent" (1.9s) they knock into each other — short deterministic jitter/collision offsets (finite, index-based). Mono kicker "AU SOMMET DU NUAGE" at y≈200.
Scene 2 (2.9–4.5s): on "sépare les charges" the particles fade back and orange "+" signs drift to the top band (y≈300–500) while cream "–" signs sink to the bottom band (y≈850–1050), staggered; a mono "TENSION" bar at y≈1250 fills left→right (`stat-bars-and-fills`) as the VO builds to "électriques…".
Scene 3 (4.5–5.0s): on "boum" an orange lightning bolt strikes from the "–" band down to a ground hairline at y≈1520 (`svg-path-draw`, ≤0.15s), a cream full-frame flash fires and decays, and the frame shakes once (finite, decaying).
Scene 4 (5.0–6.77s): h1 "éclair" (cream) lands at y≈1350 on "L'éclair" (5.0s); on "tonnerre" (6.0s) three concentric orange arcs expand outward from the strike point (`svg-path-draw` + scale) and mono "TONNERRE" appears beside them. Hold.

## Frame 6 — Type 1 : monocellulaire

- scene: Compteur « TYPE 1 / 4 ». Un seul petit cumulonimbus naît, pleut, s'effondre ; un chrono « < 1 h ». Étiquette « orage de chaleur ».
- voiceover: "Premier type : l'orage monocellulaire. Une seule cellule, moins d'une heure de vie. L'orage de chaleur des soirs d'été."
- duration: 6.152s
- transition_in: cut
- status: animated
- src: compositions/frames/06-monocellulaire.html
- type: feature_showcase
- persuasion: Numbered enumeration + Concretization
- beat: Comprehension
- blueprint: compose
- focal: the single storm cell
- roles: listicle chrome — mono "TYPE 1 / 4" + 4 nav dots (first filled orange) top-left at y≈150 = supporting (identical position in Frames 6–9) · h1 "monocellulaire" = foreground subject · one flat cream cumulonimbus + rain streaks = foreground subject · clock ring + "< 1 h" (orange) = supporting stat · tag "ORAGE DE CHALEUR" + small orange sun = supporting · ground hairline = background

narrativeRole: Premier élément de la liste : l'orage le plus simple et le plus courant.
keyMessage: Monocellulaire = une cellule, courte vie, orage de chaleur.

Scene 1 (0.0–2.2s): ink-black field, ground hairline at y≈1480. "TYPE 1 / 4" + dots appear top-left (hard cut-in); h1 "monocellulaire" reveals per-word / by chunks ("mono" then "cellulaire") on 0.8–1.2s at y≈260–420 (`dynamic-content-sequencing`).
Scene 2 (2.2–3.0s): on "une seule cellule" one flat cream cumulonimbus grows from the ground at center (x≈540, top y≈700) (scaleY from base, `power3`); mono label "1 CELLULE".
Scene 3 (3.0–4.2s): on "moins d'une heure" an orange clock ring self-draws (`svg-path-draw`) to the right of the cloud with "< 1 h" (stat-value, orange); rain streaks fall from the cloud base (finite tween).
Scene 4 (4.2–6.15s): on "orage de chaleur" a mono tag "ORAGE DE CHALEUR" + a small orange sun disc slide in at y≈1300; on "soirs d'été" the cloud's top softens/deflates slightly (it dies). Hold.

## Frame 7 — Type 2 : multicellulaire

- scene: Même scène, « TYPE 2 / 4 ». Trois cellules côte à côte naissent et meurent en relais, une frise du temps « plusieurs heures », icônes grêle + averses.
- voiceover: "Deux : le multicellulaire. Plusieurs cellules se relaient pendant des heures. Grêle et grosses averses."
- duration: 5.171s
- transition_in: cut
- status: animated
- src: compositions/frames/07-multicellulaire.html
- type: feature_showcase
- persuasion: Numbered enumeration + Build-up (une cellule → plusieurs)
- beat: Momentum
- blueprint: compose
- focal: the three relaying storm cells
- roles: listicle chrome "TYPE 2 / 4" + dots (second filled) top-left at the same spot as Frame 6 = supporting · h1 "multicellulaire" = foreground subject · three flat cream cells in a row = foreground subject · time line (hairline track filling orange) + mono "PLUSIEURS HEURES" = supporting · hail circles + rain streaks + mono "GRÊLE" / "AVERSES" = supporting · ground hairline = background

narrativeRole: Deuxième élément : même mécanique mais en équipe, donc plus long et plus fort.
keyMessage: Multicellulaire = plusieurs cellules en relais, plusieurs heures, grêle.

Scene 1 (0.0–1.6s): same stage as Frame 6 (ground hairline y≈1480, chrome top-left). h1 "multicellulaire" per-chunk ("multi" + "cellulaire") at 0.4–0.6s, y≈260–420.
Scene 2 (1.6–3.6s): on "plusieurs cellules" three cells grow in relay left→right (x≈220 / 540 / 860): cell A rises at 1.6s, cell B rises at 2.2s as A shrinks to half, cell C rises at 2.8s as B shrinks; a time track under the ground (y≈1540) fills orange left→right; mono "PLUSIEURS HEURES" lands on "heures" (3.2s).
Scene 3 (3.7–5.17s): on "grêle" cream hail circles drop from the cells (staggered, finite) with mono "GRÊLE"; on "averses" (4.4s) dense rain streaks with mono "AVERSES". Hold.

## Frame 8 — Type 3 : ligne de grains

- scene: Vue de dessus façon radar : une longue ligne courbe d'orages se forme et balaie l'écran, « centaines de km », flèches de rafales devant.
- voiceover: "Trois : la ligne de grains. Des orages alignés sur des centaines de kilomètres, avec des rafales dévastatrices."
- duration: 5.939s
- transition_in: cut
- status: animated
- src: compositions/frames/08-ligne-de-grains.html
- type: feature_showcase
- persuasion: Numbered enumeration + Concretization (vue radar)
- beat: Unease + escalation
- blueprint: compose
- focal: the squall line of storm cells (radar view)
- roles: listicle chrome "TYPE 3 / 4" + dots (third filled) = supporting · h1 "ligne de grains" = foreground subject · radar panel (concentric hairline rings + crosshair, dim) = background · bowed line of ~14 storm blobs (cream cores with orange centers) = foreground subject · ruler hairline + mono "CENTAINES DE KM" = supporting · orange chevron arrows + mono "RAFALES" = supporting

narrativeRole: Troisième élément : l'orage passe à l'échelle régionale, la menace devient le vent.
keyMessage: Ligne de grains = orages en ligne sur des centaines de km, rafales violentes.

Scene 1 (0.0–1.5s): chrome top-left (same spot); h1 "ligne de grains" per-word at 0.5–1.0s, y≈260–420; radar panel fades up behind (y≈560–1520, dim rings + crosshair).
Scene 2 (1.5–4.0s): on "alignés" ~14 storm blobs pop in sequence along a bowed line (top→bottom, index-staggered, `waterfall-entry`) at x≈400–560; the whole line then advances right ~120px (one smooth move); on "centaines de kilomètres" (2.7s) a vertical ruler hairline spans the line with mono "CENTAINES DE KM".
Scene 3 (4.0–5.94s): on "rafales" five orange chevron arrows shoot out ahead of the line to the right (`motion-blur-streak`, staggered) and mono "RAFALES" lands at 4.8s. Hold.

## Frame 9 — Type 4 : la supercellule

- scene: Fond orange, « TYPE 4 / 4 — le roi ». Une supercellule massive dont la colonne tourne en spirale, un grêlon géant « pamplemousse », rafales, une tornade descend.
- voiceover: "Et le roi : la supercellule. Son courant ascendant tourne sur lui-même. Grêlons gros comme des pamplemousses, rafales folles… et parfois, des tornades."
- duration: 8.093s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/09-supercellule.html
- type: benefit_highlight
- persuasion: Build-up (climax de la liste) + Concretization (pamplemousse)
- beat: Awe + fear
- blueprint: compose
- focal: the supercell silhouette with its rotating updraft
- roles: ORANGE register · listicle chrome "TYPE 4 / 4" + dots (fourth filled, ink) = supporting · "le roi" → "supercellule" (ink, display→h1 token swap) = foreground subject · massive ink supercell silhouette (wide base, tower, anvil, overshooting top) = foreground subject · ink spiral inside the updraft + mono "ROTATION" = supporting · giant hailstone (ink circle with segment lines, the grapefruit) + mono "GRÊLON = PAMPLEMOUSSE" = supporting · ink chevrons "RAFALES" = supporting · ink tornado funnel + mono "TORNADE" = foreground payoff

narrativeRole: Le sommet de la liste : l'orage le plus puissant, avec ce qui le rend unique (la rotation).
keyMessage: La supercellule, avec son ascendance en rotation, est l'orage le plus violent : grosse grêle et tornades.

Compose: opens on an in-place token swap ("le roi" → "supercellule"); the payoff is a non-text element (the supercell + tornado).
Scene 1 (0.0–1.9s): fire-orange field; chrome top-left "TYPE 4 / 4" (ink). "le roi" lands in ink display at y≈330 on 0.3s, then hard-cut token swap to h1 "supercellule" on 0.8s (`discrete-text-sequence`).
Scene 2 (1.9–4.2s): on "courant ascendant" the massive ink supercell silhouette rises into frame (y≈560–1450, ~90% width) with a smooth long-tail settle; on "tourne sur lui-même" (2.9s) an orange-on-ink spiral (cut-out of the silhouette, drawn in fire-orange) draws itself inside the updraft (`svg-path-draw`) and rotates ~270° once (finite), mono "ROTATION" beside it.
Scene 3 (4.2–5.7s): on "grêlons" a giant hailstone drops from the anvil to y≈1250 at the right side; on "pamplemousses" (5.0s) mono "GRÊLON = PAMPLEMOUSSE" appears next to it.
Scene 4 (5.7–8.09s): on "rafales folles" ink chevrons shoot left from the base (`motion-blur-streak`); on "tornades" (7.1s) an ink tornado funnel descends from the cloud base to the ground (scaleY from top, `power3`) with a quick ink-flash punch, mono "TORNADE". Hold.

## Frame 10 — Et en France ?

- scene: Carte de France qui se dessine : points d'orages d'été partout, spirales orange de supercellules au Sud-Ouest et à l'Est, puis zoom sur la Corse « août 2022 — derecho — 200+ km/h ».
- voiceover: "Et en France ? Surtout des orages mono et multicellulaires, l'été. Mais des supercellules frappent aussi, surtout dans le Sud-Ouest et l'Est. Et en août 2022, un derecho a balayé la Corse à plus de deux cents kilomètres-heure."
- duration: 12.317s
- transition_in: crossfade
- status: outline
- src: compositions/frames/10-france.html
- type: social_proof
- persuasion: Anchoring (carte de France) + Statistical proof (Corse 2022)
- beat: Recognition + concern
- blueprint: compose
- focal: the map of France (from assets/france-path.txt)
- roles: France outline (cream 3px stroke, path + viewBox in assets/france-path.txt; city coordinates in that same 1000×963 space: Bordeaux 308,619 · Toulouse 446,742 · Pau 323,772 · Lyon 677,528 · Nancy 770,238 · Strasbourg 877,249 · Clermont 558,526 · Grenoble 738,584 · Paris 508,222 · Lille 557,45 · Nantes 242,383 · Brest 42,267 · Marseille 714,772 · Corse center 969,886) = foreground subject · cream storm dots = supporting · orange spiral markers (supercells) = supporting · legend (mono) = supporting · Corsica highlight + "AOÛT 2022" / "derecho" / "200+ km/h" = foreground payoff

narrativeRole: Rapporte tout au spectateur français : ce qu'il croise vraiment et la preuve que le pire peut arriver ici.
keyMessage: En France on croise surtout des orages d'été classiques, mais supercellules et derechos existent.

Scene 1 (0.0–0.8s): ink-black field; mono kicker "ET EN FRANCE ?" at y≈200; the France outline self-draws in cream (`svg-path-draw`) inside a ~960px-wide box centered at y≈560–1480.
Scene 2 (0.8–3.6s): on "orages mono et multicellulaires" ~12 cream storm dots pop across the map (index-staggered, deterministic positions spread over the territory, `center-outward-expansion`), mono legend "● ORAGES D'ÉTÉ" at y≈1530 on "l'été" (3.2s).
Scene 3 (4.0–7.4s): on "supercellules" (4.3s) the dots dim to 40%; orange spiral markers pop at the Sud-Ouest (Bordeaux, Toulouse, Pau) on "Sud-Ouest" (6.6s) and at the Est (Nancy, Strasbourg, Lyon) on "l'Est" (7.3s); legend line 2 "◉ SUPERCELLULES".
Scene 4 (7.4–12.32s): on "août 2022" the camera **zooms to target** on Corsica (`coordinate-target-zoom`, ~2.2×, power3) while mono "AOÛT 2022" lands top (y≈260); on "derecho" (9.0s) h1 "derecho" (orange) lands at y≈380; on "Corse" (10.0s) Corsica fills orange and orange wind chevrons sweep across it; on "deux cents" (10.9s) a **value-scaled counter** counts to "200+ km/h" (stat-value / display, cream) at y≈1350. Hold (breather) from 11.6s.

## Frame 11 — Abonne-toi

- scene: Fond orange. Bulle de commentaire « ton pire orage ? » qui pop ; « en commentaire » ; la bulle se condense en bouton « s'abonner » qu'un tap enfonce.
- voiceover: "Et toi, c'était quoi ton pire orage ? Raconte en commentaire, et abonne-toi pour ne rien rater !"
- duration: 5.872s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/11-cta.html
- type: cta
- persuasion: Direct address + Question→answer pairing (engagement)
- beat: Resolve + connection
- blueprint: cta-morph-press (Adapt)
- focal: the comment bubble that becomes the subscribe button
- roles: ORANGE register · ink-OUTLINED speech bubble (sharp rectangle + tail, 6px ink stroke, no fill) with ink h2 "ton pire orage ?" inside = foreground subject · small ink lightning glyph = supporting · mono "↓ EN COMMENTAIRE" = supporting · solid ink CTA button with fire-orange "s'abonner" label (the one ink block) = foreground payoff · thin ink tap-ripple rings = supporting · mono sign-off "MÉTÉO · CLIMAT" = supporting

narrativeRole: Transforme la vidéo en conversation (commentaires) et en abonnement.
keyMessage: Commente ton pire orage et abonne-toi.

Adapt: keep the signature "mark condenses in place into a brighter CTA, then a human-aimed press lands"; no cursor — a tap ripple stands in for the click.
Scene 1 (0.0–1.9s): fire-orange field; an ink-outlined speech bubble pops in at y≈380–760 (`spring-pop-entrance`, smooth) and h2 "ton pire orage ?" builds per-word inside it on 0.8–1.3s; a small ink lightning glyph strikes into its corner.
Scene 2 (1.9–3.2s): on "en commentaire" mono "↓ EN COMMENTAIRE" types on under the bubble (y≈820).
Scene 3 (3.2–5.87s): on "abonne-toi" the bubble condenses at the same center into a solid ink button (`card-morph-anchor` / scale-swap) at y≈1050–1230 reading "s'abonner" in fire-orange Barlow h2; at 4.2s a tap lands — `press-release-spring` compression + two thin ink ripple rings; the label swaps to "abonné ✓" at 4.5s; mono sign-off "MÉTÉO · CLIMAT" at y≈1400. Final frame: hold to the end (a gentle final settle is allowed).
