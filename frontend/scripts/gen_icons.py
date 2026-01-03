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
    bg = (10, 12, 24, 255)
    rail = (37, 99, 235, 255)
    rail_alt = (6, 182, 212, 230)
    rail_glow = (99, 179, 237, 180)
    node_outer = (17, 24, 39, 255)
    node_inner = (234, 179, 8, 255)
    rows = make_canvas(w, h, bg)

    draw_rect(rows, 0, 0, w - 1, h - 1, bg)

    # main zig-zag rail
    p1 = (int(w*0.16), int(h*0.30))
    p2 = (int(w*0.42), int(h*0.18))
    p3 = (int(w*0.62), int(h*0.42))
    p4 = (int(w*0.80), int(h*0.24))

    draw_line(rows, *p1, *p2, 2, rail_glow)
    draw_line(rows, *p2, *p3, 2, rail)
    draw_line(rows, *p3, *p4, 2, rail_alt)

    # secondary branch
    b1 = (int(w*0.42), int(h*0.18))
    b2 = (int(w*0.64), int(h*0.64))
    draw_line(rows, *b1, *b2, 2, rail)

    nodes = [p1, p2, p3, p4, b2]
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
