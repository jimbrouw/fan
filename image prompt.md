# AI Bingo — Portrait Style Prompts

Each player uploads a selfie. The app transforms it into a stylised portrait
using image-to-image generation. The player picks a style before generating.

## Core prompt structure

Every prompt follows this pattern:

```
Transform this person's photo into [STYLE DESCRIPTION].
Preserve their facial features, likeness, hair colour, and expression so they
remain clearly recognisable. [STYLE-SPECIFIC RENDERING DETAILS].
Portrait framing, shoulders and above. High quality, professional finish.
No background clutter. Clean, shareable result.
```

---

## Styles

### Pixar
> 3D animated film character

Transform this person into a Pixar 3D animated character. Preserve their
facial structure, hair, and expression so they remain recognisable. Render as
a high-quality 3D CGI character: smooth skin, slightly large expressive eyes,
warm studio lighting, clean rounded surfaces. Pixar film quality. Portrait
framing, shoulders and above.

---

### Studio Ghibli
> Hand-drawn anime portrait

Transform this person into a Studio Ghibli anime character. Preserve their
face shape, hair, and personality. Hand-drawn watercolour anime style: soft
muted palette, gentle confident linework, warm Miyazaki aesthetic, expressive
simplified features. Portrait framing, shoulders and above.

---

### Oil Painting
> Classical portrait masterpiece

Transform this person into a classical oil painting portrait. Preserve their
exact likeness. Old Masters technique: rich warm tones, visible confident
brushstrokes, dramatic Rembrandt-style lighting from one side, deep shadow
areas, museum-quality portrait on canvas texture. Shoulders and above.

---

### Pop Art
> Andy Warhol screen-print

Transform this person into a pop art portrait in the style of Andy Warhol.
Preserve their face structure and hair. Bold flat graphic colours, high
contrast, halftone dot pattern visible in shadows, strong black outlines,
limited 4-colour palette, 1960s screen-print aesthetic. Portrait framing.

---

### Comic Book
> Superhero panel portrait

Transform this person into a comic book character portrait. Preserve their
features. Bold black ink outlines, flat cel-shaded colours, halftone dot
shading in shadow areas, dynamic side lighting, Marvel or DC comic art
quality. Portrait framing, shoulders and above.

---

### Watercolour
> Soft illustrated portrait

Transform this person into a watercolour illustrated portrait. Preserve their
likeness. Soft wet-on-wet colour washes, loose expressive brushwork, delicate
colour bleeds at edges, white paper showing through highlights, contemporary
portrait illustration style. Shoulders and above.

---

### Cyberpunk
> Neon-lit future portrait

Transform this person into a cyberpunk neon portrait. Preserve their face and
identity. Dark moody background, vivid neon pink and electric cyan rim
lighting, futuristic edge details, rain-slicked atmospheric depth, high
contrast editorial photography meets sci-fi concept art. Shoulders and above.

---

### Pencil Sketch
> Hand-drawn graphite portrait

Transform this person into a detailed pencil sketch portrait. Preserve their
likeness. Graphite pencil on white paper: realistic shading with hatching and
cross-hatching, fine line detail on facial features, clean white highlights,
classical portrait drawing technique. Shoulders and above.

---

## Notes

- Always use image-to-image mode with the selfie as the input reference
- Strength / denoising: 0.65–0.75 (preserve identity, allow style transformation)
- If the selfie is low quality, run a face-restoration pass first
- Output: square 1:1 or portrait 3:4 crop, minimum 512×512
- No text, logos, or bingo grid overlays — the portrait is used as a bingo card cell
