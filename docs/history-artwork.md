# History artwork

The current History page uses original generated historical paintings, guided
by the user's historical-painting reference and archive concept. No external
artwork or stock image has been copied into the site. The supplied painting was
used as an art-direction reference, not represented as newly generated work.

## Current illustrations

| Placement | Subject and purpose | Source original |
|---|---|---|
| Archive hero | A populated early Islamic river landscape: a provincial town, bridge, fields, river craft and small groups of travellers. Luminous neutral light gives the archive a wider historical world. | `exec-9cdaf1eb-773f-4448-9723-2369e12e8f74.png` |
| Tārīkh Khalīfa ibn Khayyāṭ | The retained early-caliphate campaign panorama: an elevated gathering, settlements, encampments and people moving across a broad landscape. | `exec-029d9b07-3210-4703-ba04-5d3c228c2eb5.png` |
| The History of al-Ṭabarī | A new interpretive Abbasid Baghdad/Tigris scene: a flat alluvial setting, river traffic, populated quays, markets, brick buildings and a bridge of boats. Represents one aspect of a much wider narrative, as stated on the page. | `exec-b53dc71f-5ad7-4cbc-92cd-b5af3288ce12.png` |
| Futūḥ al-buldān | A new conquest-era town scene: a round-arched late-antique gateway, arriving groups, town representatives, pack animals and cultivated land. | `exec-b052b911-0c2c-4508-b837-d802e823b3ac.png` |

All originals are retained under
`C:/Users/Jonathan/.codex/generated_images/01a13c5a-5981-74b0-8df7-b85f2c5eb864/`.
The user reference is `C:/Users/Jonathan/Downloads/HUilhAiWoAAD5hU.jpg`.
The archive concept is the attached
`C:/Users/Jonathan/.codex/attachments/127d19a3-ea39-45d3-a9ff-8c9c1dfbf781/image-1.png`.

The generated originals are 1672×941. Responsive book and hero assets are
1600×900 and 800×450 WebP files under `public/images/history/`. These are genuine
native-detail derivatives, not claimed as 3K renders. The Projects listing uses
an enlarged panoramic derivative at 2172×724 and an alternative at 1086×362,
under `public/images/platform/history-archive-v2*.webp`. The page hero retains
the fuller original composition rather than using that enlarged crop.

Prior image variations remain in the workspace for reference. The current page
uses the v2 city, gate and hero paintings and the retained Khalīfa panorama.
Each book has a different painting. The independent hero is also distinct.

## Art direction and historical grounding

Prompts requested historical-atlas oil/gouache painting with visible brushwork,
expansive environments, plausible architecture and material culture, small
varied people, atmospheric perspective and restrained natural light. The new
river scenes avoid repetitive orange sunset lighting and repeated commanders.
The Baghdad prompt explicitly excluded mountains, fantasy round islands,
Ottoman pencil minarets, Mughal domes and modern landmarks. The conquest-town
prompt requested late-antique stone construction and a round Roman-style arch,
rather than a pointed Crusader gateway. No named people, precise dated event,
readable inscriptions or modern political symbols were requested.

Scope and architectural references were consulted as context, not image sources:

- [Liverpool University Press edition of Khalīfa's history, hosted by JSTOR](https://www.jstor.org/stable/jj.38238653).
- [SUNY Press, The History of al-Ṭabarī volume 5](https://sunypress.edu/Books/T/The-History-of-al-abari-Vol.-52).
- [Bloomsbury / I.B. Tauris, History of the Arab Invasions](https://www.bloomsbury.com/uk/history-of-the-arab-invasions-the-conquest-of-the-lands-9780755637423/).
- [Metropolitan Museum of Art, Art of the Abbasid Period](https://www.metmuseum.org/pt/essays/the-art-of-the-abbasid-period-750-1258).
- [UNESCO, Ancient City of Bosra](https://whc.unesco.org/en/list/22).
- [French Ministry of Culture, Bosra](https://archeologie.culture.gouv.fr/en/bosra).

The Met notes that virtually nothing remains from Abbasid Baghdad. The city
painting is therefore explicitly interpretive, not a verified archaeological
reconstruction. No generated image is evidence for the historical claims in a
book. No external licensing information is fabricated; these are original
synthetic illustrations created for this project, not public-domain reproductions.

## Implementation

The page uses a full-colour panoramic hero, masked into the site's dark plate.
Source illustrations remain in natural colour inside editorial jackets. Original
aspect ratios are reserved, images have descriptive alt text, source artwork is
lazy-loaded, and image links open the full illustration without JavaScript.
Edition-note expansion occurs below the jacket, so it cannot distort its crop.

The hero is prioritized for loading. The 800-pixel alternatives serve narrower
source entries; the 1600-pixel versions support larger or denser displays. Width,
height and responsive sizes are explicit. No image-generation or image-hosting
API is called by the public page.
