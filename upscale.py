"""Upscale the 50px avatars 4x into public/assets/avatars-hd/.

    python upscale.py          # upscale every avatar without an HD copy
    python upscale.py --all    # redo them all

The game only publishes 50x50 avatars, which blur once a card draws them at
58px on a 2x screen. Real-ESRGAN's anime model (realesrgan-x4plus-anime) turns
each into 200x200 with the line art kept crisp, and cwebp stores that as a
lossy WebP at quality 80: about 7KB, a sixth of the lossless file, with no loss
you can see at card size. Run it after `npm run data` has fetched new avatars; the
page uses an HD avatar when there is one and the 50px file, then the CDN, when
there is not.

The upscaler is the portable ncnn-vulkan build and the encoder Google's
libwebp release, both downloaded once into tools/. The upscaler runs on any
Vulkan GPU, and slowly on the CPU without one.
"""

import os
import shutil
import subprocess
import sys
import tarfile
import tempfile
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
AVATARS = HERE / "public" / "assets" / "avatars"
HD = HERE / "public" / "assets" / "avatars-hd"
EXT = ".exe" if sys.platform == "win32" else ""
TOOL = HERE / "tools" / "realesrgan"
EXE = TOOL / f"realesrgan-ncnn-vulkan{EXT}"
RELEASE = "https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-{}.zip"
PLATFORM = {"win32": "windows", "darwin": "macos"}.get(sys.platform, "ubuntu")
MODEL = "realesrgan-x4plus-anime"
WEBP_TOOL = HERE / "tools" / "libwebp"
WEBP_RELEASE = "https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-1.5.0-{}"
WEBP_PLATFORM = {"win32": "windows-x64.zip", "darwin": "mac-arm64.tar.gz"}.get(sys.platform, "linux-x86-64.tar.gz")
QUALITY = "80"


def fetch(url: str, into: Path) -> None:
    print(f"tool: downloading {url}")
    into.mkdir(parents=True, exist_ok=True)
    archive = into / Path(url).name
    with urllib.request.urlopen(url, timeout=120) as response, archive.open("wb") as out:
        shutil.copyfileobj(response, out)
    if archive.suffix == ".zip":
        with zipfile.ZipFile(archive) as z:
            z.extractall(into)
    else:
        with tarfile.open(archive) as t:
            t.extractall(into, filter="data")
    archive.unlink()


def cwebp() -> Path:
    found = next(WEBP_TOOL.glob(f"*/bin/cwebp{EXT}"), None)
    if not found:
        fetch(WEBP_RELEASE.format(WEBP_PLATFORM), WEBP_TOOL)
        found = next(WEBP_TOOL.glob(f"*/bin/cwebp{EXT}"))
    found.chmod(0o755)
    return found


def encode(job: tuple[Path, Path, Path]) -> bool:
    encoder, png, webp = job
    return subprocess.run(
        [str(encoder), "-quiet", "-q", QUALITY, "-m", "6", "-sharp_yuv", str(png), "-o", str(webp)],
    ).returncode == 0


def main() -> int:
    if not AVATARS.is_dir():
        print("no public/assets/avatars/ - run `npm run data` first")
        return 1
    if not EXE.exists():
        fetch(RELEASE.format(PLATFORM), TOOL)
        EXE.chmod(0o755)
    encoder = cwebp()
    HD.mkdir(parents=True, exist_ok=True)
    avatars = sorted(AVATARS.glob("*.png"))
    todo = avatars if "--all" in sys.argv else [a for a in avatars if not (HD / f"{a.stem}.webp").exists()]
    print(f"avatars: {len(avatars) - len(todo)} upscaled, {len(todo)} to do")
    if not todo:
        return 0
    # The upscaler takes a folder, so the ones still to do are copied into one;
    # its lossless PNGs are then encoded into public/assets/avatars-hd/.
    with tempfile.TemporaryDirectory() as tmp:
        src, big = Path(tmp, "in"), Path(tmp, "out")
        src.mkdir(), big.mkdir()
        for a in todo:
            shutil.copy2(a, src)
            (HD / f"{a.stem}.webp").unlink(missing_ok=True)
        result = subprocess.run(
            [str(EXE), "-i", str(src), "-o", str(big), "-n", MODEL, "-f", "png"],
            cwd=TOOL, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True,
        )
        jobs = [(encoder, big / a.name, HD / f"{a.stem}.webp") for a in todo if (big / a.name).exists()]
        with ThreadPoolExecutor(max_workers=os.cpu_count() or 4) as pool:
            list(pool.map(encode, jobs))
    done = sum((HD / f"{a.stem}.webp").exists() for a in todo)
    print(f"avatars: {done} upscaled, {len(todo) - done} failed")
    if result.returncode or done < len(todo):
        print(result.stderr.strip().splitlines()[-1] if result.stderr.strip() else f"exit {result.returncode}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
