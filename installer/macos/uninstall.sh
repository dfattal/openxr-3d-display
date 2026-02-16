#!/bin/bash
# Uninstall SRMonado OpenXR runtime from macOS
set -e

echo "=== SRMonado Uninstaller ==="

echo "Removing SRMonado runtime..."
sudo rm -rf "/Library/Application Support/SRMonado"

echo "Removing OpenXR runtime registration..."
sudo rm -f /etc/xdg/openxr/1/active_runtime.json

echo "Removing test app..."
rm -rf "/Applications/SimCubeOpenXR.app"

echo "Forgetting installer receipts..."
sudo pkgutil --forget com.leiainc.srmonado.runtime 2>/dev/null || true
sudo pkgutil --forget com.leiainc.srmonado.testapp 2>/dev/null || true

echo "=== SRMonado uninstalled ==="
