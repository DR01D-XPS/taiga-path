"""Read visible sprite bounds; do not modify the supplied artwork."""
import json
import sys
from collections import deque
from PIL import Image


def bounds(filename):
    with Image.open(filename) as image:
        alpha = image.getchannel("A")
        width, height = image.size
        # A small mask is enough to locate the body and reject isolated edge debris.
        mask = alpha.copy()
        mask.thumbnail((256, 256), Image.Resampling.NEAREST)
        w, h = mask.size
        pixels = bytearray(1 if value >= 24 else 0 for value in mask.tobytes())
        largest = (0, (0, 0, w, h))
        for start in range(w * h):
            if not pixels[start]:
                continue
            pixels[start] = 0
            queue = deque([start])
            count, left, top, right, bottom = 0, w, h, 0, 0
            while queue:
                pos = queue.popleft()
                x, y = pos % w, pos // w
                count += 1
                left, top = min(left, x), min(top, y)
                right, bottom = max(right, x + 1), max(bottom, y + 1)
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h and pixels[ny * w + nx]:
                        pixels[ny * w + nx] = 0
                        queue.append(ny * w + nx)
            if count > largest[0]:
                largest = (count, (left, top, right, bottom))
        left, top, right, bottom = largest[1]
        crop = (max(0, int((left - 2) * width / w)), max(0, int((top - 2) * height / h)),
                min(width, int((right + 2) * width / w)), min(height, int((bottom + 2) * height / h)))
        exact = alpha.crop(crop).point(lambda value: 255 if value >= 24 else 0).getbbox()
        if not exact:
            raise ValueError(f"Empty sprite: {filename}")
        x, y, x2, y2 = exact
        return {"width": width, "height": height, "x": crop[0] + x, "y": crop[1] + y,
                "right": crop[0] + x2, "bottom": crop[1] + y2}


print(json.dumps({filename: bounds(filename) for filename in json.load(sys.stdin)}))
