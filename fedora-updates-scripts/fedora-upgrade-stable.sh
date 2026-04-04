#!/bin/bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC}  $1" >&2; }
log_ok()      { echo -e "${GREEN}[OK]${NC}    $1" >&2; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $1" >&2; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1" >&2; }
log_section() { echo -e "\n${BOLD}${CYAN}=== $1 ===${NC}" >&2; }

check_root() {
  if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root (sudo)."
    exit 1
  fi
}

get_current_version() {
  grep -oP '(?<=release )\d+' /etc/fedora-release
}

get_latest_stable_version() {
  local api_url="https://endoflife.date/api/fedora.json"

  log_info "Retrieving version information via endoflife.date..."

  local response
  if ! response=$(curl -sf --max-time 10 "$api_url" 2>/dev/null); then
    log_warn "endoflife.date API unreachable, falling back to current+1..."
    echo ""
    return 1
  fi

  local today
  today=$(date +%Y-%m-%d)

  local latest
  latest=$(echo "$response" \
    | grep -oP '"cycle"\s*:\s*"\K[0-9]+' \
    | sort -rn \
    | while read -r ver; do
        release_date=$(echo "$response" \
          | python3 -c "
import sys, json
data = json.load(sys.stdin)
for item in data:
    if str(item.get('cycle','')) == '$ver':
        print(item.get('releaseDate','9999-99-99'))
        break
" 2>/dev/null || echo "9999-99-99")

        eol=$(echo "$response" \
          | python3 -c "
import sys, json
data = json.load(sys.stdin)
for item in data:
    if str(item.get('cycle','')) == '$ver':
        eol = item.get('eol', False)
        print('true' if eol == True else ('false' if eol == False else str(eol)))
        break
" 2>/dev/null || echo "false")

        if [[ "$release_date" > "$today" ]]; then
          continue
        fi

        if [[ "$eol" == "true" ]]; then
          continue
        fi

        echo "$ver"
        break
      done)

  if [[ -z "$latest" ]]; then
    echo ""
    return 1
  fi

  echo "$latest"
}

show_system_info() {
  log_section "System Information"
  echo -e "  ${BOLD}OS         :${NC} $(cat /etc/fedora-release)"
  echo -e "  ${BOLD}Kernel     :${NC} $(uname -r)"
  echo -e "  ${BOLD}Date       :${NC} $(date '+%Y-%m-%d %H:%M:%S')"
}

step_preupgrade() {
  log_section "Step 1/3 — Updating current system"
  log_info "Updating all packages before the system upgrade..."
  if dnf upgrade --refresh -y; then
    log_ok "System is up to date."
  else
    log_error "The pre-upgrade update failed."
    exit 1
  fi
}

step_download() {
  local target_ver="$1"
  log_section "Step 2/3 — Downloading Fedora $target_ver (stable)"
  log_info "Downloading packages for stable version $target_ver..."

  if ! dnf system-upgrade download --releasever="$target_ver" -y; then
    log_warn "Conflicts detected, retrying with --allowerasing..."
    if ! dnf system-upgrade download --releasever="$target_ver" --allowerasing -y; then
      log_error "Download failed. Please check DNF logs."
      exit 1
    fi
  fi

  log_ok "Download completed successfully."
}

step_reboot_upgrade() {
  local target_ver="$1"
  log_section "Step 3/3 — Reboot & Upgrade to Fedora $target_ver"

  echo -e "\n${YELLOW}${BOLD}  ⚠️  WARNING${NC}"
  echo -e "  The system will ${BOLD}reboot${NC} to apply the upgrade."
  echo -e "  Do ${BOLD}NOT${NC} power off the system during this process.\n"

  if [[ "${AUTO_CONFIRM:-false}" == "false" ]]; then
    read -r -p "  Initiate reboot now? [y/N] " confirm
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
      log_warn "Upgrade cancelled. Please run manually: sudo dnf system-upgrade reboot"
      exit 0
    fi
  fi

  dnf system-upgrade reboot
}

parse_args() {
  TARGET_VERSION=""
  AUTO_CONFIRM=false

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --to|-t)
        TARGET_VERSION="$2"
        shift 2
        ;;
      --yes|-y)
        AUTO_CONFIRM=true
        shift
        ;;
      --help|-h)
        echo "Usage: sudo $0 [OPTIONS]"
        echo ""
        echo "  Upgrade Fedora to the next STABLE version."
        echo ""
        echo "Options:"
        echo "  --to, -t <ver>   Force a target version (e.g., --to 43)"
        echo "  --yes, -y        Skip confirmation before rebooting"
        echo "  --help, -h       Display this help message"
        echo ""
        echo "Examples:"
        echo "  sudo $0              # Detect and upgrade to the latest stable version"
        echo "  sudo $0 --to 43      # Force Fedora 43"
        echo "  sudo $0 --yes        # Upgrade without confirmation"
        exit 0
        ;;
      *)
        log_error "Unknown argument: $1. Please run with --help for assistance."
        exit 1
        ;;
    esac
  done
}

main() {
  echo -e "\n${BOLD}${CYAN}  fedora-upgrade-stable.sh${NC}${CYAN} — Stable Version Upgrader${NC}"
  echo -e "  ────────────────────────────────────────────────\n"

  parse_args "$@"
  check_root
  show_system_info

  local current_ver
  current_ver=$(get_current_version)

  local target_ver
  if [[ -n "${TARGET_VERSION:-}" ]]; then
    target_ver="$TARGET_VERSION"
    log_info "Target version forced: Fedora $target_ver (stable)"
  else
    target_ver=$(get_latest_stable_version || echo "")

    if [[ -z "$target_ver" ]]; then
      target_ver=$((current_ver + 1))
      log_warn "Unable to determine stable version via API, falling back to: Fedora $target_ver"
    else
      log_ok "Latest stable version detected: Fedora $target_ver"
    fi
  fi

  if [[ "$target_ver" -le "$current_ver" ]]; then
    log_ok "You are already on the latest stable version (Fedora $current_ver). No action required."
    exit 0
  fi

  echo -e "\n  ${BOLD}Planned upgrade:${NC} Fedora ${CYAN}${current_ver}${NC} → Fedora ${GREEN}${target_ver}${NC} ${GREEN}(stable)${NC}\n"

  if [[ "${AUTO_CONFIRM:-false}" == "false" ]]; then
    read -r -p "  Please confirm the upgrade to Fedora $target_ver (stable) [y/N]: " confirm
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
      log_warn "Upgrade cancelled."
      exit 0
    fi
  fi

  step_preupgrade
  step_download "$target_ver"
  step_reboot_upgrade "$target_ver"

  echo ""
}

main "$@"
