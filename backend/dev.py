"""
Start: python dev.py
Stop:  python dev.py stop
"""
import os
import signal
import sys
from pathlib import Path

PID_FILE = Path(__file__).parent / ".pid"


def start():
    import subprocess
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=Path(__file__).parent,
    )
    PID_FILE.write_text(str(proc.pid))
    print(f"Server started (PID {proc.pid}) — http://localhost:8000")
    print("Stop with: python dev.py stop")
    try:
        proc.wait()
    except KeyboardInterrupt:
        proc.terminate()
        proc.wait()
    finally:
        PID_FILE.unlink(missing_ok=True)
        print("Server stopped.")


def stop():
    if not PID_FILE.exists():
        print("No running server found.")
        return
    pid = int(PID_FILE.read_text())
    try:
        os.kill(pid, signal.SIGTERM)
        PID_FILE.unlink(missing_ok=True)
        print(f"Stopped server (PID {pid}).")
    except ProcessLookupError:
        PID_FILE.unlink(missing_ok=True)
        print("Process already gone.")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "stop":
        stop()
    else:
        start()
