"""
ocr-capture.py
Captura un área de pantalla seleccionada con el mouse, extrae el texto con OCR
y lo copia al portapapeles.

Uso:
    python utilities/ocr-capture.py

Hotkey: Alt+F1
    - Mueve el mouse a la esquina superior-izquierda del área
    - Presiona Alt+F1
    - Mueve el mouse a la esquina inferior-derecha
    - Presiona Alt+F1 de nuevo
    - El texto OCR queda en el portapapeles

Dependencias:
    pip install pillow mss pyperclip keyboard pytesseract
    Tesseract-OCR instalado en C:/Program Files/Tesseract-OCR/tesseract.exe
"""

import keyboard
import pyperclip
import pytesseract
import mss
from PIL import Image, ImageEnhance, ImageFilter
import sys
import time

# Ruta al binario de Tesseract en Windows
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Estado de la selección
_points: list[tuple[int, int]] = []
_running = True


def get_mouse_pos() -> tuple[int, int]:
    """Obtiene la posición actual del mouse usando ctypes (sin dependencias extra)."""
    import ctypes
    class POINT(ctypes.Structure):
        _fields_ = [("x", ctypes.c_long), ("y", ctypes.c_long)]
    pt = POINT()
    ctypes.windll.user32.GetCursorPos(ctypes.byref(pt))
    return (pt.x, pt.y)


def preprocess(img: Image.Image) -> Image.Image:
    """Preprocesa la imagen para mejorar el OCR en texto de UI de videojuego."""
    # Escalar 2x para mejorar reconocimiento de texto pequeño
    w, h = img.size
    img = img.resize((w * 2, h * 2), Image.LANCZOS)
    # Aumentar contraste
    img = ImageEnhance.Contrast(img).enhance(2.0)
    # Convertir a escala de grises
    img = img.convert("L")
    # Umbral para binarizar
    img = img.point(lambda p: 255 if p > 128 else 0)
    return img


def capture_and_ocr(x1: int, y1: int, x2: int, y2: int) -> str:
    """Captura el área y extrae texto con OCR."""
    # Normalizar coordenadas
    left   = min(x1, x2)
    top    = min(y1, y2)
    width  = abs(x2 - x1)
    height = abs(y2 - y1)

    if width < 10 or height < 10:
        return ""

    with mss.mss() as sct:
        monitor = {"left": left, "top": top, "width": width, "height": height}
        screenshot = sct.grab(monitor)
        img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")

    img = preprocess(img)

    # Config: modo página = bloque de texto uniforme
    config = "--psm 6"
    text = pytesseract.image_to_string(img, config=config)

    # Limpiar líneas vacías múltiples
    lines = [l.rstrip() for l in text.splitlines()]
    lines = [l for l in lines if l.strip()]
    return "\n".join(lines)


def on_hotkey():
    global _points, _running

    pos = get_mouse_pos()

    if len(_points) == 0:
        _points.append(pos)
        print(f"  Punto 1 registrado: {pos}")
        print("  Mueve el mouse a la esquina inferior-derecha y presiona Ctrl+Shift+C")

    elif len(_points) == 1:
        _points.append(pos)
        x1, y1 = _points[0]
        x2, y2 = _points[1]
        print(f"  Punto 2 registrado: {pos}")
        print(f"  Capturando área ({x1},{y1}) → ({x2},{y2})...")

        text = capture_and_ocr(x1, y1, x2, y2)

        if text:
            pyperclip.copy(text)
            print(f"\n--- Texto copiado al portapapeles ---\n{text}\n-------------------------------------")
        else:
            print("  No se detectó texto en el área seleccionada.")

        _points = []
        print("\nListo. Presiona Alt+F1 para una nueva captura, Alt+F2 para salir.")


def on_quit():
    global _running
    print("\nSaliendo...")
    _running = False


def main():
    print("=== OCR Capture ===")
    print("Hotkey: Alt+F1  — registrar punto (2 veces para capturar)")
    print("Hotkey: Alt+F2  — salir")
    print()
    print("Presiona Alt+F1 sobre la esquina superior-izquierda del área...")

    keyboard.add_hotkey("alt+f1", on_hotkey)
    keyboard.add_hotkey("alt+f2", on_quit)

    while _running:
        time.sleep(0.1)

    keyboard.unhook_all()


if __name__ == "__main__":
    main()
