"""Convertit CV_2026.pdf en image PNG haute résolution pour un affichage web responsive."""
import pypdfium2 as pdfium

SRC = "CV_2026.pdf"
OUT = "CV_2026.png"
SCALE = 3.0  # ~216 DPI, net sur les écrans Retina

pdf = pdfium.PdfDocument(SRC)
page = pdf[0]
bitmap = page.render(scale=SCALE)
image = bitmap.to_pil()
image.save(OUT, optimize=True)
print(f"OK -> {OUT} ({image.width}x{image.height})")
pdf.close()
