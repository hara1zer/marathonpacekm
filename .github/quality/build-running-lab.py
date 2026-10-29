"""Generate the static Running Lab hub and registry-owned collection blocks.

Authoring: add a published study to running-lab-studies.json, add metadata/related
markers to its original article, then run this helper and sync-navigation.py.
No production build, client-side collection fetch or separate CMS is required.
Use --check in QA to detect stale committed output without changing files.
"""
from datetime import date
from html import escape
from pathlib import Path
import argparse
import json
import re
import xml.etree.ElementTree as ET

from site_navigation import apply_navigation, VERSION

ROOT = Path(__file__).resolve().parents[2]
REGISTRY = Path(__file__).with_name("running-lab-studies.json")
DOMAIN = "https://marathonpacekm.com"
HUB = "/running-lab/"
TITLE = "The Running Lab | Real Race Data, Training Experiments & Pacing Analysis"
DESCRIPTION = "Original race experiences, recorded splits and personal fueling experiments. Explore the evidence, its limits and practical tools in the MarathonPaceKM Running Lab."
CSS_VERSION = "20261029"


def load_collection():
    collection = json.loads(REGISTRY.read_text())
    studies = collection["studies"]
    ids = {study["id"] for study in studies}
    assert len(ids) == len(studies), "Duplicate study IDs"
    assert len({study["url"] for study in studies}) == len(studies), "Duplicate study URLs"
    categories = {item["id"] for item in collection["categories"]}
    for study in studies:
        assert study["url"].startswith("/blog/") and study["url"].endswith("/")
        assert (ROOT / study["url"].lstrip("/") / "index.html").is_file(), study["url"]
        assert set(study["categories"]) <= categories
        assert set(study["related_studies"]) <= ids - {study["id"]}
        assert date.fromisoformat(study["published"]) <= date.fromisoformat(study["modified"])
    return collection


def load_studies():
    return load_collection()["studies"]


def display_date(value):
    parsed = date.fromisoformat(value)
    return f"{parsed.day} {parsed.strftime('%B %Y')}"


def render_study_card(study, compact=False):
    """A crawlable card, with evidence and insight in the full hub variant."""
    if compact:
        return (f'<article class="mpkm-story-card" data-study-id="{escape(study["id"])}">'
                f'<span class="mpkm-story-kind">{escape(study["content_type"])}</span>'
                f'<h3><a href="{escape(study["url"])}">{escape(study["title"])}</a></h3>'
                f'<p>{escape(study["description"])}</p></article>')
    if study.get("image"):
        image = study["image"]
        viewbox = ET.parse(ROOT / image['src'].lstrip('/')).getroot().attrib['viewBox'].split()
        width, height = (int(float(value)) for value in viewbox[2:])
        visual = (f'<div class="lab-card-figure"><img src="{escape(image["src"])}" '
                  f'alt="{escape(image["alt"])}" width="{width}" height="{height}" loading="lazy"></div>')
    else:
        visual = (f'<div class="lab-card-figure lab-card-question"><span>{escape(study["content_type"])}</span>'
                  f'<p>{escape(study["question"])}</p>'
                  '<small>A practical question, not a claim of a controlled experiment</small></div>')
    evidence = "; ".join(study["available_data"][:2])
    return (f'<article class="lab-study-card" data-study-id="{escape(study["id"])}">{visual}'
            f'<div class="lab-card-body"><p class="lab-card-kind">{escape(study["content_type"])}</p>'
            f'<h3><a href="{escape(study["url"])}">{escape(study["title"])}</a></h3>'
            f'<p class="lab-card-insight">{escape(study["insight"])}</p>'
            f'<dl class="lab-card-evidence"><dt>Evidence available</dt><dd>{escape(evidence)}.</dd></dl>'
            f'<a class="lab-card-link" href="{escape(study["url"])}">Read the complete investigation <span aria-hidden="true">→</span></a>'
            '</div></article>')


def render_collection_cards(studies=None, compact=False):
    studies = load_studies() if studies is None else studies
    return "".join(render_study_card(study, compact=compact) for study in studies)


def render_blog_collection(studies=None):
    """Keep the historical anchor and description contracts on the guides hub."""
    studies = load_studies() if studies is None else studies
    ordered = sorted(studies, key=lambda study: ["melbourne", "sydney", "rebuilding", "fueling"].index(study["id"])
                     if study["id"] in ["melbourne", "sydney", "rebuilding", "fueling"] else 4)
    return ('<section class="mpkm-story-hub" id="personal-experience"><p class="eyebrow">Original Running Lab investigations</p>'
            '<h2>Original investigations in the Running Lab</h2><p>Personal experience and recorded data live in '
            '<a href="/running-lab/">the Running Lab</a>. The guides below explain broader running questions.</p>'
            '<div class="mpkm-story-grid">' + render_collection_cards(ordered, compact=True) + '</div></section>')


def render_home_collection(studies=None):
    studies = load_studies() if studies is None else studies
    return ('<section class="mpkm-story-hub" id="runner-story" aria-labelledby="home-lab-title">'
            '<p class="eyebrow">Original evidence from my own running</p><h2 id="home-lab-title">The Running Lab</h2>'
            '<p>Real running data. Real race experiences. Practical lessons you can test yourself.</p>'
            '<p><a href="/running-lab/">Explore the Running Lab: recorded race comparisons, training questions and personal fueling trials</a>.</p>'
            '<div class="mpkm-story-grid">' + render_collection_cards(studies, compact=True) + '</div></section>')


def render_sitemap_collection(studies=None):
    studies = load_studies() if studies is None else studies
    return ('<section class="card" aria-labelledby="running-lab"><h2 id="running-lab">Running Lab: original investigations</h2>'
            '<ul><li><a href="/running-lab/">The Running Lab: all original investigations</a></li>' +
            ''.join(f'<li><a href="{escape(study["url"])}">{escape(study["title"])}</a></li>' for study in studies) + '</ul></section>')


def render_study_metadata(study):
    return ('<div class="lab-study-meta"><p><a href="/running-lab/">The Running Lab</a>'
            f' <span aria-hidden="true">/</span> <strong>{escape(study["content_type"])}</strong></p>'
            f'<p class="lab-study-dates">First published <time datetime="{study["published"]}">{display_date(study["published"])}</time>'
            f' · Revised <time datetime="{study["modified"]}">{display_date(study["modified"])}</time></p></div>')


def render_evidence_summary(study):
    return ('<dl class="lab-evidence-summary">' +
            "".join(f'<div><dt>{label}</dt><dd>{escape(study[field])}</dd></div>' for label, field in
                    [("Question", "question"), ("Observation", "observed"), ("Reading boundary", "limitations"), ("Practical takeaway", "takeaway")]) +
            '</dl>')


def render_related_tools(study):
    return ('<div class="lab-related-tools"><h3>Tools for your next decision</h3><ul>' +
            "".join(f'<li><a href="{escape(tool["url"])}">{escape(tool["title"])}</a><p>{escape(tool["description"])}</p></li>'
                    for tool in study["related_tools"]) + '</ul></div>')


def render_related_studies(study, studies=None):
    studies = load_studies() if studies is None else studies
    by_id = {item["id"]: item for item in studies}
    links = "".join(
        f'<li><span class="lab-card-kind">{escape(by_id[identifier]["content_type"])}</span>'
        f'<a href="{escape(by_id[identifier]["url"])}">{escape(by_id[identifier]["title"])}</a></li>'
        for identifier in study["related_studies"])
    return ('<aside class="lab-related" aria-labelledby="lab-related-title">'
            '<h2 id="lab-related-title">Continue in the Running Lab</h2>'
            f'<ul class="lab-related-list">{links}</ul>{render_related_tools(study)}'
            '<p class="lab-related-back"><a href="/running-lab/">Explore all Running Lab investigations</a></p></aside>')


def render_category(category, studies):
    selected = [study for study in studies if category["id"] in study["categories"]]
    assert selected, "Do not publish empty categories"
    items = "".join(
        f'<li data-study-id="{escape(study["id"])}"><span>{escape(study["content_type"])}</span>'
        f'<a href="{escape(study["url"])}">{escape(study["title"])}</a></li>' for study in selected)
    return (f'<section class="lab-category" id="{escape(category["id"])}">'
            f'<h3>{escape(category["title"])}</h3><p>{escape(category["description"])}</p><ul>{items}</ul></section>')


def render_hub(collection):
    studies = collection["studies"]
    featured = [study for study in studies if study["featured"]]
    schema = {
        "@context": "https://schema.org", "@type": "CollectionPage",
        "@id": DOMAIN + HUB + "#collection", "url": DOMAIN + HUB, "name": TITLE,
        "description": DESCRIPTION, "datePublished": collection["hub"]["published"],
        "dateModified": collection["hub"]["modified"], "inLanguage": "en-AU",
        "author": {"@type": "Person", "name": "Davin Pinto", "url": DOMAIN + "/about/#author"},
        "mainEntity": {"@type": "ItemList", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": study["title"], "url": DOMAIN + study["url"]}
            for i, study in enumerate(studies)]}}
    categories = "".join(render_category(category, studies) for category in collection["categories"])
    category_links = "".join(f'<a href="#{escape(item["id"])}">{escape(item["title"])}</a>' for item in collection["categories"])
    tools = [
        ("/marathon-time-predictor/", "Marathon time predictor", "Test the conversion assumptions discussed in the Sydney review. A projected time is a scenario, not proof of readiness."),
        ("/marathon-pace-calculator/", "Pace calculator", "Build your own elapsed checkpoints. Keep the planned schedule separate from the watch-lap observations."),
        ("/marathon-fueling-calculator/", "Fueling calculator", "Count the actual servings in a chosen schedule and compare its full-run average with a target."),
        ("/race-conditions-pace-adjuster/", "Race conditions pace adjuster", "Explore an explicitly hypothetical conditions adjustment. The Lab does not invent weather data for past races."),
        ("/monthly-training-plan/", "Monthly training planner", "Include all four recent weeks, including interruptions, when organising a proposed training block.")]
    tool_markup = "".join(f'<li><a href="{url}">{title}</a><p>{description}</p></li>' for url, title, description in tools)
    document = f'''<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(TITLE)}</title>
<meta name="description" content="{escape(DESCRIPTION, quote=True)}">
<link rel="canonical" href="{DOMAIN + HUB}">
<meta property="og:type" content="website">
<meta property="og:title" content="{escape(TITLE, quote=True)}">
<meta property="og:description" content="{escape(DESCRIPTION, quote=True)}">
<meta property="og:url" content="{DOMAIN + HUB}">
<meta property="og:image" content="{DOMAIN}/assets/original/sydney-selected-race-splits.svg">
<meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.svg?v=20260922" type="image/svg+xml">
<link rel="alternate icon" href="/favicon.ico?v=20260922">
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=20260922">
<link rel="stylesheet" href="/assets/site.css?v={VERSION}">
<link rel="stylesheet" href="/assets/running-lab.css?v={CSS_VERSION}">
<script defer src="/assets/site-telemetry.js?v=20261008-audit"></script>
<script defer src="/assets/navigation.js?v={VERSION}"></script>
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False, indent=2)}</script>
</head>
<body class="mpkm-legacy mpkm-index mpkm-lab">
<main class="wrap" id="content">
<section class="lab-hero" aria-labelledby="lab-title">
  <div class="lab-hero-copy">
    <p class="lab-eyebrow">Marathon Pace KM / Original investigations</p>
    <h1 id="lab-title">The Running Lab</h1>
    <p class="lab-positioning">Real running data. Real race experiences. Practical lessons you can test yourself.</p>
    <p>What can a race actually tell us? Here I put my running experiences beside recorded data, examine the gaps, and turn the useful questions into practical decisions and tools.</p>
    <div class="lab-actions"><a class="lab-button" href="#featured-investigations">Explore the investigations</a><a class="lab-text-link" href="#how-the-lab-works">How the Lab works <span aria-hidden="true">↗</span></a></div>
    <p class="lab-hero-byline">By <a href="/about/#author">Davin Pinto</a> · Collection published <time datetime="{collection["hub"]["published"]}">{display_date(collection["hub"]["published"])}</time></p>
  </div>
  <aside class="lab-hero-record" aria-labelledby="lab-start-title">
    <p class="lab-record-label">Start with a real question</p>
    <h2 id="lab-start-title">A strong half.<br>A marathon that faded.</h2>
    <p>A 1:50:57 half put sub-four in view. The selected Sydney laps help examine what happened next without pretending to explain every cause.</p>
    <dl><div><dt>Recorded</dt><dd>8 selected watch laps</dd></div><div><dt>Missing</dt><dd>Km 26 and the full race trace</dd></div></dl>
    <a href="/blog/sydney-marathon-2026-personal-review/#split-explorer">Open the selected-split explorer <span aria-hidden="true">→</span></a>
  </aside>
</section>
<nav class="lab-category-jump" aria-label="Running Lab categories">{category_links}</nav>
<section class="lab-section" id="featured-investigations" aria-labelledby="lab-featured-title">
  <div class="lab-section-heading"><p class="lab-eyebrow">Experience, then examination</p><h2 id="lab-featured-title">Featured investigations</h2><p>Three accounts with different kinds of evidence. The distinction is part of the finding.</p></div>
  <div class="lab-feature-grid">{render_collection_cards(featured)}</div>
</section>
<section class="lab-section" id="explore-the-lab" aria-labelledby="lab-explore-title">
  <div class="lab-section-heading"><p class="lab-eyebrow">Follow the question</p><h2 id="lab-explore-title">Explore the Lab</h2><p>Four ways into the same founding collection. Each link leads to a published article at its original address.</p></div>
  <div class="lab-category-grid">{categories}</div>
</section>
<section class="lab-method" id="how-the-lab-works" aria-labelledby="lab-method-title">
  <div><p class="lab-eyebrow">A transparent process</p><h2 id="lab-method-title">How the Lab works</h2><p>A personal record can be useful without being a controlled experiment. What matters is being clear about what is known and what is still a question.</p></div>
  <ol><li><strong>Start with a practical question.</strong> What decision would a runner make differently?</li><li><strong>Gather the original observations.</strong> Use recorded laps, training totals and personal notes; label recollections as recollections.</li><li><strong>Analyse in context.</strong> Check the arithmetic and relevant research without treating association as a cause.</li><li><strong>Show the boundary.</strong> Separate recorded observations, calculated scenarios, interpretations and unresolved gaps.</li><li><strong>Make the next step useful.</strong> Offer a practical takeaway, a record to keep or an existing tool for the decision.</li></ol>
</section>
<section class="lab-section" id="lab-tools" aria-labelledby="lab-tools-title">
  <div class="lab-section-heading"><p class="lab-eyebrow">From investigation to action</p><h2 id="lab-tools-title">Tools for your own running questions</h2><p>The studies explain why a question matters. These tools let you explore your own inputs; their outputs do not establish what caused a past race result.</p></div>
  <ul class="lab-tool-grid">{tool_markup}</ul>
</section>
<section class="lab-editorial" id="lab-editorial" aria-labelledby="lab-editorial-title">
  <h2 id="lab-editorial-title">Personal evidence, with its limits visible</h2>
  <p>The founding collection is my own running: two Run Melbourne half marathons, a Sydney Marathon build and race, personal gel trials and the rebuild I intend to make. A proposed plan is not a completed experiment; a watch split is not an official course checkpoint.</p>
  <p>The original articles retain their source notes and publication dates. The Sydney and Melbourne articles include downloadable transcribed data. Missing observations are left missing. No product comparison here is controlled, and no calculator supplies medical clearance or a guarantee of race performance.</p>
  <p>Read <a href="/about/#author">about the author</a>, the <a href="/editorial-policy/">editorial policy</a> and <a href="/methodology/">calculator methods</a>. To query a transcription or interpretation, <a href="/contact/">send a correction</a>. For broader educational resources, use the <a href="/blog/">running guides hub</a>.</p>
</section>
</main>
</body>
</html>
'''
    return apply_navigation(document, HUB)


def replace_marker(source, name, content):
    pattern = re.compile(r"(<!-- running-lab:" + re.escape(name) + r":start -->).*?(<!-- running-lab:" + re.escape(name) + r":end -->)", re.S)
    updated, count = pattern.subn(lambda match: match[1] + "\n" + content + "\n" + match[2], source)
    assert count <= 1, f"Duplicate Running Lab {name} marker"
    return updated


def replace_collection_marker(source, name, content):
    pattern = re.compile(r'(<!-- RUNNING-LAB:' + re.escape(name) + r':START -->).*?(<!-- RUNNING-LAB:' + re.escape(name) + r':END -->)', re.S)
    updated, count = pattern.subn(lambda match: match[1] + '\n' + content + '\n' + match[2], source)
    assert count == 1, f'Expected one Running Lab {name} collection marker'
    return updated


def sync_xml_collection(source, collection):
    """Add/update only collection URLs; preserve unrelated URLs and their dates."""
    entries = [(HUB, collection['hub']['modified'])] + [(study['url'], study['modified']) for study in collection['studies']]
    for route, modified in entries:
        url = DOMAIN + route
        pattern = re.compile(r'<url>\s*<loc>' + re.escape(url) + r'</loc>.*?</url>', re.S)
        matches = pattern.findall(source)
        assert len(matches) <= 1, f'Duplicate XML sitemap URL: {route}'
        if matches:
            original = matches[0]
            if '<lastmod>' in original:
                updated = re.sub(r'<lastmod>[^<]*</lastmod>', f'<lastmod>{modified}</lastmod>', original)
            else:
                updated = original.replace('</url>', f'<lastmod>{modified}</lastmod></url>')
            source = pattern.sub(lambda match: updated, source)
        else:
            source = source.replace('</urlset>', f'  <url><loc>{url}</loc><lastmod>{modified}</lastmod></url>\n</urlset>')
    return source


def generate(check=False):
    collection = load_collection()
    expected = {ROOT / "running-lab/index.html": render_hub(collection)}
    for study in collection["studies"]:
        path = ROOT / study["url"].lstrip("/") / "index.html"
        source = path.read_text()
        updated = replace_marker(source, "metadata", render_study_metadata(study))
        updated = replace_marker(updated, "related", render_related_studies(study, collection["studies"]))
        expected[path] = updated
    # Registry-owned index blocks allow a future study to appear in all listings.
    for relative, marker, renderer in [
        ("blog/index.html", "BLOG", lambda: render_blog_collection(collection["studies"])),
        ("index.html", "HOME", lambda: render_home_collection(collection["studies"])),
        ("sitemap/index.html", "SITEMAP", lambda: render_sitemap_collection(collection["studies"])),
    ]:
        path = ROOT / relative
        source = path.read_text()
        expected[path] = replace_collection_marker(source, marker, renderer())
    xml_path = ROOT / 'sitemap.xml'
    expected[xml_path] = sync_xml_collection(xml_path.read_text(), collection)
    stale = [path for path, content in expected.items() if not path.exists() or path.read_text() != content]
    if not check:
        for path in stale:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(expected[path])
    return [path.relative_to(ROOT).as_posix() for path in stale]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check generated output without changing files")
    args = parser.parse_args()
    stale = generate(check=args.check)
    if args.check and stale:
        raise SystemExit("Running Lab output is stale: " + ", ".join(stale))
    print(("Running Lab output current" if args.check else "Built Running Lab: " + ", ".join(stale)) + ".")

