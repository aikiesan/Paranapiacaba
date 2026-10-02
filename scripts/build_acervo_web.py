"""Gera versões leves (WebP) das imagens do acervo para o site.

As fotos originais do acervo (public/acervo/**) chegam a 8000 px e 5 MB cada;
o portal carrega miniaturas na grade e uma versão de tela no visualizador.

Saída, espelhando o caminho original:
  public/acervo/_web/<pasta>/<nome>-480.webp   (miniatura, lado maior 480 px)
  public/acervo/_web/<pasta>/<nome>-1600.webp  (visualizador, lado maior 1600 px)

Uso:  python scripts/build_acervo_web.py
"""
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ACERVO = ROOT / "public" / "acervo"
OUT = ACERVO / "_web"
SIZES = {480: 72, 1600: 80}
EXTENSIONS = {".jpg", ".jpeg", ".png"}
# Pranchas A0 exportadas a 300 dpi passam do limite padrão do Pillow; são
# arquivos do próprio projeto.
Image.MAX_IMAGE_PIXELS = None


def main() -> None:
    sources = [
        p for p in ACERVO.rglob("*")
        if p.suffix.lower() in EXTENSIONS and OUT not in p.parents
    ]
    for src in sorted(sources):
        rel = src.relative_to(ACERVO).with_suffix("")
        image = None
        for size, quality in SIZES.items():
            dest = OUT / f"{rel}-{size}.webp"
            if dest.exists() and dest.stat().st_mtime >= src.stat().st_mtime:
                continue
            if image is None:
                image = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
            copy = image.copy()
            copy.thumbnail((size, size), Image.LANCZOS)
            dest.parent.mkdir(parents=True, exist_ok=True)
            copy.save(dest, "WEBP", quality=quality, method=6)
            print(f"{dest.relative_to(ROOT)}  {copy.size[0]}x{copy.size[1]}  {dest.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
