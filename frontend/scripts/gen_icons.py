import os
import struct
import zlib

PUBLIC = os.path.join(os.path.dirname(__file__), '..', 'public')
os.makedirs(PUBLIC, exist_ok=True)


def chunk(tag, data):
    return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)


def write_png_pixels(path, width, height, rows):
    raw = b''.join([b'\x00' + bytes(row) for row in rows])
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    with open(path, 'wb') as fh:
        fh.write(sig)
        fh.write(chunk(b'IHDR', ihdr))
        fh.write(chunk(b'IDAT', zlib.compress(raw)))
        fh.write(chunk(b'IEND', b''))


def make_canvas(width, height, color):
    r, g, b, a = color
    row = bytearray([r, g, b, a] * width)
    return [bytearray(row) for _ in range(height)]


def set_pixel(rows, x, y, color):
    if y < 0 or y >= len(rows):
        return
    width = len(rows[0]) // 4
    if x < 0 or x >= width:
        return
    idx = x * 4
    rows[y][idx:idx+4] = bytes(color)


def draw_rect(rows, x0, y0, x1, y1, color):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            set_pixel(rows, x, y, color)


def draw_circle(rows, cx, cy, radius, color):
    r2 = radius * radius
    for y in range(cy - radius, cy + radius + 1):
        for x in range(cx - radius, cx + radius + 1):
            if (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r2:
                set_pixel(rows, x, y, color)


def draw_line(rows, x0, y0, x1, y1, thickness, color):
    steps = max(abs(x1 - x0), abs(y1 - y0)) or 1
    for i in range(steps + 1):
        t = i / steps
        x = int(round(x0 + (x1 - x0) * t))
        y = int(round(y0 + (y1 - y0) * t))
        draw_circle(rows, x, y, thickness, color)


def render_icon(size):
    w = h = size
    bg = (12, 16, 33, 255)
    pipe = (88, 166, 255, 255)
    glow = (59, 130, 246, 180)
    node_outer = (18, 27, 52, 255)
    node_inner = (191, 242, 100, 255)
    rows = make_canvas(w, h, bg)

    draw_rect(rows, 0, 0, w - 1, h - 1, bg)
    draw_line(rows, int(w*0.18), int(h*0.28), int(w*0.48), int(h*0.30), 2, glow)
    draw_line(rows, int(w*0.48), int(h*0.30), int(w*0.70), int(h*0.55), 2, pipe)
    draw_line(rows, int(w*0.48), int(h*0.30), int(w*0.70), int(h*0.18), 2, pipe)

    nodes = [
        (int(w*0.18), int(h*0.28)),
        (int(w*0.48), int(h*0.30)),
        (int(w*0.70), int(h*0.18)),
        (int(w*0.70), int(h*0.55)),
    ]
    for cx, cy in nodes:
        draw_circle(rows, cx, cy, max(3, size//18), node_outer)
        draw_circle(rows, cx, cy, max(2, size//24), node_inner)

    return rows


targets = {
    'favicon.png': 64,
    'logo192.png': 192,
    'logo512.png': 512,
}

for name, size in targets.items():
    out_path = os.path.abspath(os.path.join(PUBLIC, name))
    rows = render_icon(size)
    write_png_pixels(out_path, size, size, rows)
    print(f"wrote {name} ({size}x{size}) -> {out_path}")
