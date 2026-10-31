from __future__ import annotations

import argparse
import shutil
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image


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


def remove_background(image: Image.Image) -> Image.Image:
    arr = np.array(image.convert("RGBA"), dtype=np.uint8)
    rgb = arr[..., :3].astype(np.int16)

    mx = rgb.max(axis=2)
    mn = rgb.min(axis=2)
    delta = mx - mn

    # Светлый малонасыщенный фон, похожий на студийный белый.
    bg_candidate = (mn >= 198) & (delta <= 56)
    bg = edge_connected(bg_candidate)

    alpha = arr[..., 3].copy()
    alpha[bg] = 0

    # Смягчение ореолов по краю фигуры.
    near_bg = np.zeros_like(bg)
    near_bg[:-1, :] |= bg[1:, :]
    near_bg[1:, :] |= bg[:-1, :]
    near_bg[:, :-1] |= bg[:, 1:]
    near_bg[:, 1:] |= bg[:, :-1]

    fringe = (~bg) & near_bg & (mn >= 162) & (delta <= 84)
    fade = np.clip((mn - 162) * 3, 0, 220).astype(np.uint8)
    alpha[fringe] = np.minimum(alpha[fringe], 255 - fade[fringe])

    arr[..., 3] = alpha
    return Image.fromarray(arr, "RGBA")


def main() -> None:
    parser = argparse.ArgumentParser(description="Удаление белого фона у спрайтов Янсели.")
    parser.add_argument(
        "--root",
        default=".",
        help="Корневая папка проекта (по умолчанию текущая).",
    )
    parser.add_argument(
        "--backup-dir",
        default="_backup_sprites_original",
        help="Папка для резервных копий исходных png.",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve()
    backup_dir = root / args.backup_dir
    backup_dir.mkdir(exist_ok=True)

    sprite_paths = []
    for path in sorted(root.glob("*.png")):
        if "янсели" not in path.name.lower():
            continue
        with Image.open(path) as img:
            w, h = img.size
        if w >= 2000 and h >= 1000:
            sprite_paths.append(path)

    if not sprite_paths:
        print("Спрайты для обработки не найдены.")
        return

    for src in sprite_paths:
        backup_path = backup_dir / src.name
        if not backup_path.exists():
            shutil.copy2(src, backup_path)

        with Image.open(src) as image:
            processed = remove_background(image)
        processed.save(src)
        print(f"OK: {src.name}")

    print(f"Обработано файлов: {len(sprite_paths)}")
    print(f"Бэкапы: {backup_dir}")


if __name__ == "__main__":
    main()
