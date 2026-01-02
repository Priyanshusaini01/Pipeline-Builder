import os
import struct
import zlib

PUBLIC = os.path.join(os.path.dirname(__file__), '..', 'public')
os.makedirs(PUBLIC, exist_ok=True)

def write_png(path, width, height, rgba):
    r, g, b, a = rgba
    raw = b''.join([b'\x00' + bytes([r, g, b, a]) * width for _ in range(height)])

    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xFFFFFFFF)

    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)

    with open(path, 'wb') as fh:
        fh.write(sig)
        fh.write(chunk(b'IHDR', ihdr))
        fh.write(chunk(b'IDAT', zlib.compress(raw)))
        fh.write(chunk(b'IEND', b''))

palette = {
    'favicon.png': ((59, 130, 246, 255), (64, 64)),
    'logo192.png': ((52, 211, 153, 255), (192, 192)),
    'logo512.png': ((234, 179, 8, 255), (512, 512)),
}

for name, (rgba, size) in palette.items():
    width, height = size
    out_path = os.path.abspath(os.path.join(PUBLIC, name))
    write_png(out_path, width, height, rgba)
    print(f"wrote {name} ({width}x{height}) -> {out_path}")
