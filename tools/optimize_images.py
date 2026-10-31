from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "optimized"
BG_OUT = OUT / "bg"
CHAR_OUT = OUT / "chars"
CHAR_DESKTOP_OUT = CHAR_OUT / "desktop"
CHAR_MOBILE_OUT = CHAR_OUT / "mobile"


BACKGROUND_SOURCES = {
    "scene1_landscape": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/1 горизонталь.jpeg",
    "scene1_portrait": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/1 вертикаль.jpeg",
    "scene4_landscape": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/4 горизонталь.jpeg",
    "scene4_portrait": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/4 вертикаль.jpeg",
    "scene9_10_landscape": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/9, 10 горизонталь.jpeg",
    "scene9_10_portrait": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/9, 10 вертикаль.jpeg",
    "scene11_landscape": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/11 горизонталь.jpeg",
    "scene11_portrait": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/11 вертикаль.jpeg",
    "scene12_landscape": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/12 горизонталь.jpeg",
    "scene12_portrait": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/12 вертикаль.jpeg",
    "scene16_landscape": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/16 горизонталь.jpeg",
    "scene16_portrait": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/16 вертикаль.jpeg",
    "s2_intro_landscape": "LAST VS/НАНАЙЦЫ/СУЛУНГУ_АКТ_2_ВСЕ-КАРТИНКИ/2 сцена 1 горизонталь.png",
    "s2_intro_portrait": "LAST VS/НАНАЙЦЫ/СУЛУНГУ_АКТ_2_ВСЕ-КАРТИНКИ/2 сцена 1 вертикаль.png",
    "s2_journey_landscape": "LAST VS/НАНАЙЦЫ/СУЛУНГУ_АКТ_2_ВСЕ-КАРТИНКИ/2 сцена 5 горизонт.jpg",
    "s2_journey_portrait": "LAST VS/НАНАЙЦЫ/СУЛУНГУ_АКТ_2_ВСЕ-КАРТИНКИ/2 сцена 5 верт.jpg",
    "s2_rapids_landscape": "LAST VS/НАНАЙЦЫ/СУЛУНГУ_АКТ_2_ВСЕ-КАРТИНКИ/2 сцена 6 горизонт.jpg",
    "s2_rapids_portrait": "LAST VS/НАНАЙЦЫ/СУЛУНГУ_АКТ_2_ВСЕ-КАРТИНКИ/2 сцена 6 верт.jpg",
    "s2_threshold_landscape": "LAST VS/НАНАЙЦЫ/СУЛУНГУ_АКТ_2_ВСЕ-КАРТИНКИ/2 сцена 7 горизонт.jpg",
    "s2_threshold_portrait": "LAST VS/НАНАЙЦЫ/СУЛУНГУ_АКТ_2_ВСЕ-КАРТИНКИ/2 сцена 7 верт.jpg",
    "s2_shore_landscape": "LAST VS/НАНАЙЦЫ/СУЛУНГУ_АКТ_2_ВСЕ-КАРТИНКИ/2 сцена 8 горизонт.jpg",
    "s2_shore_portrait": "LAST VS/НАНАЙЦЫ/СУЛУНГУ_АКТ_2_ВСЕ-КАРТИНКИ/2 сцена 8 верт.jpg",
    "s5_intro_landscape": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/5 сцена/1 горизонт.png",
    "s5_intro_portrait": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/5 сцена/1 верт.png",
    "s5_offering_landscape": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/5 сцена/старший у камня  кладет кусок мяса горизонт.png",
    "s5_offering_portrait": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/5 сцена/старший у камня  кладет кусок мяса вертикаль.png",
    "s6_intro_landscape": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/орочи —  экспедиция вдоль берега горизонт.png",
    "s6_intro_portrait": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/орочи —  экспедиция вдоль берега вертикал.png",
    "s6_boat_flip_landscape": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/лодка переворачивается горизонт.png",
    "s6_boat_flip_portrait": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/лодка переворачивается верт.png",
    "s6_orcas_landscape": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/3 касатки горизонт.png",
    "s6_orcas_portrait": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/3 касатки верт.png",
    "s6_warning_shot_landscape": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/с пистолетом горизонт.JPG",
    "s6_warning_shot_portrait": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/с пистолетом вертикаль.JPG",
    "s6_reconcile_landscape": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/забрались обратно в лодку горизонт.png",
    "s6_reconcile_portrait": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/забрались обратно в лодку вертик.png",
    "s6_disgust_landscape": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/в лодке с отвращением смотрят на нас горизонт.png",
    "s6_disgust_portrait": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/в лодке с отвращением смотрят на нас вертикал.png",
    "s6_explain_landscape": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/на лодке. Третий ороч с нами разговаривает горизонт.png",
    "s6_explain_portrait": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/на лодке. Третий ороч с нами разговаривает вертик.png",
    "s6_oroch_leave_landscape": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/на берегу, Орочи уходят, горизонт.png",
    "s6_oroch_leave_portrait": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/на берегу, Орочи уходят,вертик.png",
    "s6_final_landscape": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/финал горизонт.png",
    "s6_final_portrait": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/6 сцена/финал вертик.png",
    "ending_final_landscape": "последний фрейм/фон горизонтальный.png",
    "ending_final_portrait": "последний фрейм/фон вертикальный.png",
}

CHARACTER_SOURCES = {
    "yanseli3": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/янсели_3.png_202605271212.jpeg",
    "yanseli5": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/янсели_5.png_202605271213.jpeg",
    "yanseli6": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/янсели_6.png_202605271214.jpeg",
    "yanseli7": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/янсели_7.png_202605271214.jpeg",
    "yanseli8": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/янсели_8.png_202605271214.jpeg",
    "yanseli9": "C:/Users/ilyli/Downloads/image_2026-06-05_18-17-10.png",
    "yanseli10": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/янсели_10.png_202605271215.jpeg",
    "yanseli11": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/янсели_11.png_202605271216.jpeg",
    "yanseli13": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/янсели_13.png_202605271215.jpeg",
    "yanseli14": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/янсели_14.png_202605271215.jpeg",
    "yanseli15": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/янсели_15.png_202605271215.jpeg",
    "yanseli17": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/янсели_17.png_202605271216.jpeg",
    "yanseli18": "LAST VS/НАНАЙЦЫ/СУЛУНГУ АКТ 1_ВСЕ КАРТИНКИ/янсели_18.png_202605271216.jpeg",
    "s2_yanseli_intro": "LAST VS/НАНАЙЦЫ/СУЛУНГУ_АКТ_2_ВСЕ-КАРТИНКИ/2 сцена янсели_1.png_202605271212.jpeg",
    "s2_yanseli_neutral": "LAST VS/НАНАЙЦЫ/СУЛУНГУ_АКТ_2_ВСЕ-КАРТИНКИ/2 сцена янсели 2.png_202605271219.jpeg",
    "s2_yanseli_kind": "LAST VS/НАНАЙЦЫ/СУЛУНГУ_АКТ_2_ВСЕ-КАРТИНКИ/2 сцена янсели 3.png_202605271220.jpeg",
    "s2_yanseli_angry": "LAST VS/НАНАЙЦЫ/СУЛУНГУ_АКТ_2_ВСЕ-КАРТИНКИ/2 сцена янсели 4.png_202605271221.jpeg",
    "s5_elder_neutral": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/5 сцена/старший появление.png",
    "s5_elder_displeased": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/5 сцена/старший ответ а,б.png",
    "s5_elder_pleased": "LAST VS/НАНАЙЦЫ/3_АКТ_УДЭГЕЙЦЫ/5 и 6 сцена/5 сцена/старший ответ в.png",
}


def ensure_dirs() -> None:
    BG_OUT.mkdir(parents=True, exist_ok=True)
    CHAR_DESKTOP_OUT.mkdir(parents=True, exist_ok=True)
    CHAR_MOBILE_OUT.mkdir(parents=True, exist_ok=True)


def edge_connected(mask: np.ndarray) -> np.ndarray:
    h, w = mask.shape
    visited = np.zeros((h, w), dtype=np.bool_)
    queue: deque[tuple[int, int]] = deque()

    for x in range(w):
        if mask[0, x]:
            queue.append((0, x))
        if mask[h - 1, x]:
            queue.append((h - 1, x))

    for y in range(h):
        if mask[y, 0]:
            queue.append((y, 0))
        if mask[y, w - 1]:
            queue.append((y, w - 1))

    while queue:
        y, x = queue.popleft()
        if visited[y, x] or not mask[y, x]:
            continue

        visited[y, x] = True

        if y > 0 and not visited[y - 1, x] and mask[y - 1, x]:
            queue.append((y - 1, x))
        if y < h - 1 and not visited[y + 1, x] and mask[y + 1, x]:
            queue.append((y + 1, x))
        if x > 0 and not visited[y, x - 1] and mask[y, x - 1]:
            queue.append((y, x - 1))
        if x < w - 1 and not visited[y, x + 1] and mask[y, x + 1]:
            queue.append((y, x + 1))

    return visited


def remove_white_studio_bg(image: Image.Image) -> Image.Image:
    arr = np.array(image.convert("RGBA"), dtype=np.uint8)
    rgb = arr[..., :3].astype(np.int16)
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    delta = mx - mn

    bg_candidate = (mn >= 220) & (delta <= 85)
    bg = edge_connected(bg_candidate)

    alpha = arr[..., 3].copy()
    alpha[bg] = 0

    near_bg = np.zeros_like(bg)
    near_bg[:-1, :] |= bg[1:, :]
    near_bg[1:, :] |= bg[:-1, :]
    near_bg[:, :-1] |= bg[:, 1:]
    near_bg[:, 1:] |= bg[:, :-1]

    fringe = (~bg) & near_bg & (mn >= 185) & (delta <= 125)
    fade = np.clip((mn - 185) * 3, 0, 244).astype(np.uint8)
    alpha[fringe] = np.minimum(alpha[fringe], 255 - fade[fringe])

    arr[..., 3] = alpha
    return Image.fromarray(arr, "RGBA")


def remove_dark_studio_bg(image: Image.Image) -> Image.Image:
    arr = np.array(image.convert("RGBA"), dtype=np.uint8)
    rgb = arr[..., :3].astype(np.int16)
    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    delta = mx - mn

    bg_candidate = (mx <= 32) & (delta <= 36)
    bg = edge_connected(bg_candidate)

    alpha = arr[..., 3].copy()
    alpha[bg] = 0

    near_bg = np.zeros_like(bg)
    near_bg[:-1, :] |= bg[1:, :]
    near_bg[1:, :] |= bg[:-1, :]
    near_bg[:, :-1] |= bg[:, 1:]
    near_bg[:, 1:] |= bg[:, :-1]

    fringe = (~bg) & near_bg & (mx <= 70) & (delta <= 60)
    fade = np.clip((70 - mx) * 4, 0, 244).astype(np.uint8)
    alpha[fringe] = np.minimum(alpha[fringe], 255 - fade[fringe])

    arr[..., 3] = alpha
    return Image.fromarray(arr, "RGBA")


def trim_transparent(image: Image.Image, pad_ratio: float = 0.04, min_pad: int = 16) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.split()[-1]
    bbox = alpha.getbbox()
    if not bbox:
        return rgba

    left, top, right, bottom = bbox
    pad = max(min_pad, int(max(rgba.size) * pad_ratio))
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(rgba.width, right + pad)
    bottom = min(rgba.height, bottom + pad)
    return rgba.crop((left, top, right, bottom))


def convert_backgrounds() -> tuple[int, int]:
    src_total = 0
    dst_total = 0

    for key, source_name in BACKGROUND_SOURCES.items():
        src = ROOT / source_name
        if not src.exists():
            raise FileNotFoundError(f"Background source not found: {src}")

        dst = BG_OUT / f"{key}.webp"
        src_total += src.stat().st_size

        with Image.open(src) as image:
            rgb = image.convert("RGB")
            rgb.save(dst, format="WEBP", quality=80, method=6)

        dst_total += dst.stat().st_size

    return src_total, dst_total


def resize_keep_aspect(image: Image.Image, max_width: int) -> Image.Image:
    w, h = image.size
    if w <= max_width:
        return image.copy()
    ratio = max_width / float(w)
    size = (max_width, int(h * ratio))

    if image.mode != "RGBA":
        return image.resize(size, Image.Resampling.LANCZOS)

    arr = np.array(image, dtype=np.float32)
    alpha = arr[..., 3:4] / 255.0
    arr[..., :3] *= alpha

    premultiplied = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    resized = premultiplied.resize(size, Image.Resampling.LANCZOS)
    out = np.array(resized, dtype=np.float32)
    out_alpha = out[..., 3:4] / 255.0

    safe_alpha = np.where(out_alpha > 0.0001, out_alpha, 1.0)
    out[..., :3] = np.where(out_alpha > 0.0001, out[..., :3] / safe_alpha, 0)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA")


def preprocess_character(char_id: str, image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha_extrema = rgba.getchannel("A").getextrema()
    has_source_transparency = alpha_extrema[0] < 250

    if (
        char_id.startswith("yanseli")
        or char_id.startswith("s2_")
        or char_id.startswith("s5_elder")
    ):
        if char_id == "yanseli9" and not has_source_transparency:
            rgba = remove_dark_studio_bg(rgba)
        elif not has_source_transparency:
            rgba = remove_white_studio_bg(rgba)
        rgba = trim_transparent(rgba)
        alpha = np.array(rgba.getchannel("A"), dtype=np.uint8)
        alpha[alpha < 36] = 0
        rgba.putalpha(Image.fromarray(alpha, "L"))

    return rgba


def convert_characters() -> tuple[int, int]:
    src_total = 0
    dst_total = 0

    for char_id, source_name in CHARACTER_SOURCES.items():
        src = ROOT / source_name
        if not src.exists():
            raise FileNotFoundError(f"Character source not found: {src}")

        src_total += src.stat().st_size

        with Image.open(src) as image:
            rgba = preprocess_character(char_id, image)

            desktop_img = resize_keep_aspect(rgba, max_width=1800)
            desktop_dst = CHAR_DESKTOP_OUT / f"{char_id}.webp"
            desktop_img.save(desktop_dst, format="WEBP", lossless=True, method=6)

            mobile_img = resize_keep_aspect(rgba, max_width=1400)
            mobile_dst = CHAR_MOBILE_OUT / f"{char_id}.webp"
            mobile_img.save(mobile_dst, format="WEBP", lossless=True, method=6)

        dst_total += desktop_dst.stat().st_size
        dst_total += mobile_dst.stat().st_size

    return src_total, dst_total


def mb(x: int) -> float:
    return x / (1024 * 1024)


def main() -> None:
    ensure_dirs()
    bg_src, bg_dst = convert_backgrounds()
    ch_src, ch_dst = convert_characters()

    total_src = bg_src + ch_src
    total_dst = bg_dst + ch_dst
    saved = total_src - total_dst
    ratio = (saved / total_src * 100) if total_src else 0

    print(f"Backgrounds: {mb(bg_src):.2f} MB -> {mb(bg_dst):.2f} MB")
    print(f"Characters:  {mb(ch_src):.2f} MB -> {mb(ch_dst):.2f} MB")
    print(f"Total:       {mb(total_src):.2f} MB -> {mb(total_dst):.2f} MB")
    print(f"Saved:       {mb(saved):.2f} MB ({ratio:.1f}%)")


if __name__ == "__main__":
    main()
