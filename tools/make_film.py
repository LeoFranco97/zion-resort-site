# A slow, wordless placeholder film made from the painted landscape. Needs ffmpeg.
import cv2, numpy as np, subprocess
src = cv2.imread('public/img/land-2.webp')
W, H = 960, 640
pipe = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', '24', '-i', '-',
                         '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '30', '-movflags', '+faststart', 'public/img/film.mp4'], stdin=subprocess.PIPE)
n = 192
for i in range(n):
    t = (1 - np.cos(i / n * 2 * np.pi)) / 2  # goes there and back, so the loop has no seam
    z = 1.06 + .1 * t
    sw, sh = src.shape[1] / z, src.shape[0] / z
    x0 = (src.shape[1] - sw) * (.2 + .6 * t); y0 = (src.shape[0] - sh) * .6
    M = np.array([[W / sw, 0, -x0 * W / sw], [0, H / sh, -y0 * H / sh]], np.float32)
    f = cv2.warpAffine(src, M, (W, H), flags=cv2.INTER_LINEAR)
    g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    sep = np.stack([g * .34, g * .62, g * 1.05], 2)  # warm sepia, as the original's film card
    pipe.stdin.write((np.clip(sep, 0, 1) * 255).astype(np.uint8).tobytes())
pipe.stdin.close(); pipe.wait()
