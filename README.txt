SARA CORPORATION WEBSITE
========================

HOW TO OPEN
- Double-click index.html, or upload the whole "website" folder to any static host
  (cPanel, Netlify, Vercel, GitHub Pages, S3 — no server software required).

PAGES — 14 in total (every menu item is its own page)

  MENU STRUCTURE
    Home
    About
    Why Sara
    Production        (dropdown, mirrors the old saracorporation.com menu)
      - Woven Apparel
      - Knitted Apparel
      - Sublimation
      - Printed Fabrics
      - Lamination
    Products
    Facility          (dropdown)
      - Our Facility
      - Factory Tour
    Responsibility
    Get a Quote

  The dropdown parent is still a link: clicking "Production" goes to the
  production overview page, clicking the small caret opens the submenu. On phones
  the caret turns the submenu into an accordion inside the slide-down menu.

  PRODUCTION PAGES
  production.html       Overview of the five units + what they share
  woven-apparel.html    10 floors / 20 lines / 1000+ machines, salient features
  knitted-apparel.html  Vertical knitwear unit, gauge 4-28, 4500 kg/day
  sublimation.html      Computerised circular & flat knitting, hand knitting
  printed-fabrics.html  Printing & dyeing division, 12 colour rotary, wet line
  lamination.html       Bottom wear unit — denim, trousers, machinery
  factory-tour.html     12 stop photo tour + company film + visit details

  NOTE ON CONTENT: the specifications on the five production pages and the
  factory tour come from the existing saracorporation.com pages. One thing to
  check — the old site's "Lamination" page actually describes the Bottom Wear
  unit (denim jeans and trousers), not lamination. That copy has been carried
  across as it stands. If the page should describe fabric lamination instead,
  send the correct text and it is a five minute change.

PAGES (every menu item is its own page)
  index.html            Home — hero, story teaser, strengths teaser, categories,
                        video, capacity, certifications, markets
  about.html            Our story, timeline, mission & vision, core values, people
  why-sara.html         Six strengths, value chain, capacity, quality assurance,
                        certifications
  products.html         Full product catalogue + factory gallery, zoomable viewer
  facility.html         Operations sequence, machinery, warehouse & security,
                        factory gallery, company film
  responsibility.html   ESG triad, sustainability, our people, certifications
  contact.html          Contact details, working hours, quote form, export markets

To add a page, copy any inner page (about.html is a good template), then add one
<li> to the menu in the header of every page so navigation stays consistent.

SCREEN WIDTHS
  The layout is fluid and steps up on larger monitors instead of sitting in a
  narrow column:
      up to 1499px    content max 1220px
      1500px+         1360px
      1700px+         1520px, product grid goes to 5 columns
      1900px+         1660px, base text grows to 17px
      2200px+         1840px, base text 18px, product grid 6 columns
      2600px+         2040px
  Below 880px the menu collapses to the burger; below 620px everything stacks to
  a single column. Side gutters scale with the screen at every step, and the
  header always lines up with the content beneath it.

FOLDERS
  assets/site.css   all styling (one file, shared by both pages)
  assets/site.js    all behaviour (one file, no libraries)
  assets/fonts/     Inter web font, self hosted (5 weights, ~47 KB each)
  images/stills/    18 frames pulled from the company video
  images/products/  product photography
  images/facility/  factory, office, machines, warehouse, solar, security
  images/certs/     certification logos

WHY IT IS FAST
- Two HTML pages, one CSS file, one JS file. No framework, no jQuery, no CDN.
- Fonts are self hosted, so there is no third-party DNS lookup or connection.
- The YouTube player is NOT loaded until someone clicks play. Before that the
  video costs nothing at all.
- Every image below the first screen is lazy loaded, with width/height set so
  the layout never jumps.
- The stylesheet and script are cached once and reused across both pages.
- Preloader appears instantly because its styles are inlined in the page head.

PRELOADER
- Navy screen, Sara logo inside a white circle with a spinning teal/orange ring,
  wordmark and progress bar. Fades out when the page has loaded (minimum 0.65s so
  it never flickers). Hard safety cut-off at 6 seconds. Hidden entirely if
  JavaScript is disabled, so nobody can ever get stuck on it.

COMPANY VIDEO
- Opens in a dialog from three places: the hero "Watch the film" button, the
  "Take a walk through our factory" banner, and the contact/footer links.
- Uses youtube-nocookie.com — no YouTube tracking cookie until playback starts.
- To change the video, edit one attribute in index.html:
      <div class="modal" id="vmodal" data-yt="_WuRXvN8lEo" ...>
  Replace _WuRXvN8lEo with the new YouTube video id.

IMAGE VIEWER (GALLERY)
- Click any product photo, factory photo or machinery photo.
- Zoom: mouse wheel, the + / − buttons, double-click, or pinch on touch.
  Range is 100% to 500%. The reset button (circular arrow) returns to 100%.
- Pan: drag with the mouse or finger once zoomed in.
- Browse: on-screen arrows, left/right arrow keys, or swipe on touch.
- Close: the X, click the dark background, or press Esc.
- Keyboard shortcuts: + zoom in, − zoom out, 0 reset, Esc close.
- To add an image to the viewer anywhere on the site, put two attributes on it:
      data-lb="path/to/full-size.jpg" data-lb-title="Caption shown top left"

WHERE THE FORM AND VIDEO LIVE NOW
- The quote form is on contact.html. Every "Get a Quote" / "Request a Quote"
  button across the site points there.
- The company film opens from index.html (hero and factory banner),
  facility.html (banner) and contact.html (Company Film row).

CONTACT FORM (ONE-TIME ACTIVATION NEEDED)
- The quote form posts to FormSubmit (https://formsubmit.co) and the enquiry is
  emailed to contact@saracorporation.com.
- The FIRST submission triggers an activation email to contact@saracorporation.com.
  Someone must click the confirmation link once. Every submission after that is
  delivered automatically.
- Spam protection: hidden honeypot field plus FormSubmit's captcha step.
- If you move to your own backend later, change only the form's action="" URL.

VIDEO STILLS
- 18 clean frames were exported from the company film at full 1920x1080 and saved
  to  ..\video stills\  as well as website\images\stills\.
- Every frame with burned-in video captions was rejected and re-taken from a
  neighbouring second, so these are usable as plain photographs anywhere —
  brochures, decks, social posts.

IMAGES ARE STILL UNOPTIMISED (BY REQUEST)
- Product and facility photos are the originals, only renamed. Optimise before
  going live; the heaviest are:
      products/thermal-gray.jpg     13.9 MB
      products/henley-olive.jpg     11.3 MB
      products/henley-navy.jpg       9.4 MB
      products/henley-green.jpg      8.0 MB
      products/shirt-pink-floral.jpg 4.5 MB
      products/shirt-green-leaf.jpg  4.0 MB
      certs/wrap.png                 1.7 MB
- Recommended: resize to 1400 px on the long side, save JPG/WebP at quality 80.
  Lazy loading keeps the page fast today, but the viewer will feel snappier once
  these are trimmed.
- Four product TIFFs were converted to JPG at quality 95 (browsers cannot display
  TIFF). No other image was touched.

ANIMATIONS
- Scroll progress bar across the top of every page (teal to orange).
- Reveal on scroll with direction variants and staggered groups: add
  data-stagger="90" to any grid and its children animate in one after another,
  90ms apart.
- Hero headline rises line by line on load; page headers do the same.
- Section headings draw an underline under the accent colour words.
- Parallax on inner page header images.
- Dropdown opens with a scale and fade, its items cascading in.
- Cards lift with a light sweep across them on hover.
- Statistics count up when they scroll into view.
- Everything above is disabled automatically for visitors who have
  "reduce motion" turned on in their operating system.

DESIGN NOTES
- Inspired by utopia.pk (cinematic full-bleed hero, oversized headline, tall
  category tiles), sapphiremills.com (corporate card grids, credibility strip,
  clean whitespace) and agidenim.com (bold claim-led statements, ESG triad).
- Colour roles are deliberate and consistent:
      Navy   #0E2A52  structure and authority — header, dark bands, footer
      Teal   #16B6C9  brand accent — eyebrows, icons, links, highlights
      Orange #FF6300  action only — buttons, statistics, step numbers
  Orange is rationed to roughly one tenth of the page so it always means
  "look here" or "click here".
- Typeface is Inter — the current standard for readable screen interfaces.

TESTING NOTE FOR DEVELOPERS
- Adding ?flat to a URL disables scroll animations and pins the hero height.
  It exists only to make automated full-page screenshots reliable and has no
  effect on the live site.
