#!/bin/bash
# Uninstall DisplayXR OpenXR runtime from macOS
set -e

echo "=== DisplayXR Uninstaller ==="

echo "Removing DisplayXR runtime..."
sudo rm -rf "/Library/Application Support/DisplayXR"

echo "Removing OpenXR runtime registration..."
sudo rm -f /etc/xdg/openxr/1/active_runtime.json

echo "Removing test app..."
rm -rf "/Applications/DisplayXRCube.app"

echo "Forgetting installer receipts..."
sudo pkgutil --forget com.displayxr.displayxr.runtime 2>/dev/null || true
sudo pkgutil --forget com.displayxr.displayxr.testapp 2>/dev/null || true

echo "=== DisplayXR uninstalled ==="
