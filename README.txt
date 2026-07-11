SARA CORPORATION WEBSITE — NOTES
=================================

WHAT THIS IS
- Single-file website: index.html (all CSS and JS inline, zero external requests, no frameworks).
- Open index.html directly in any browser, or host the whole "website" folder anywhere (any static host works).

STRUCTURE
  website/
    index.html          <- the whole site
    images/
      sara-logo.png     <- company logo (also used as favicon)
      products/         <- product photos (from "company photos/new products")
      facility/         <- factory, office, machines, operations, drone, solar, security
      certs/            <- certification logos

IMAGE NOTES (per your instruction, NO image was optimized or resized)
- All images copied byte-for-byte from your folders, only renamed for the web.
- Exception: 4 TIFF files cannot be displayed by browsers, so they were CONVERTED
  to JPG at quality 95, full resolution (no downscale):
    230828_BJs_0380.tif      -> products/shirt-tropical-yellow.jpg
    230828_BJs_0386B.tif     -> products/shirt-tropical-aqua.jpg
    230828_BJs_0386C.tif     -> products/shirt-floral-pink.jpg
    SSA288 BLUE FLORAL.tiff  -> products/shirt-floral-green.jpg

HEAVY FILES TO REVIEW BEFORE GOING LIVE (biggest wins when you optimize later):
    products/thermal-gray.jpg    13.9 MB
    products/henley-olive.jpg    11.3 MB
    products/henley-navy.jpg      9.4 MB
    products/henley-green.jpg     8.0 MB
    products/shirt-pink-floral.jpg 4.5 MB
    products/shirt-green-leaf.jpg  4.0 MB
    products/polo-pink.jpg         2.7 MB
    certs/wrap.png                 1.7 MB
  Everything below the first screen is lazy-loaded, so the page still opens fast,
  but these will slow the product grid on slow connections until optimized.
  Recommended target: max 1200px on the long side, JPG/WebP quality ~80.

PERFORMANCE FEATURES ALREADY BUILT IN
- One HTML file, no libraries, no CDN scripts.
- Font: Inter from Google Fonts (display=swap — text renders immediately with the
  system font, upgrades when Inter arrives; falls back to Segoe UI offline).
- Hero image preloaded; every other image lazy-loads.
- Width/height set on images to avoid layout shift.
- Works without JavaScript (animations and filters simply switch off).

CONTACT FORM (IMPORTANT — ONE-TIME ACTIVATION)
- The quote form posts to FormSubmit (https://formsubmit.co), a free service for
  static sites. Submissions arrive at contact@saracorporation.com.
- FIRST submission triggers an activation email to contact@saracorporation.com —
  someone must click the confirmation link once. After that, all form submissions
  are delivered normally.
- Spam protection: hidden honeypot field + FormSubmit's own captcha page.
- If you later get a backend or a form provider of your own, just change the
  form's action= URL in index.html.

THEME
  Navy  #0E2A52 -> structure and trust: nav, headings, dark bands, footer
  Teal  #16B6C9 -> brand accent: kickers, icons, links, chips, markets band
  Orange #FF6300 -> action only: CTAs, stat numbers, step numbers, highlights
