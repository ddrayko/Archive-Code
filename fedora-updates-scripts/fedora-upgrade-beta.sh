#!/bin/bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC}  $1" >&2; }
log_ok()      { echo -e "${GREEN}[OK]${NC}    $1" >&2; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $1" >&2; }
log_beta()    { echo -e "${MAGENTA}[BETA]${NC}  $1" >&2; }
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
  local response
  local today
  today=$(date +%Y-%m-%d)

  if ! response=$(curl -sf --max-time 10 "$api_url" 2>/dev/null); then
    echo ""
    return 1
  fi

  echo "$response" \
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
      done
}

check_beta_exists() {
  local ver="$1"
  local beta_url="https://dl.fedoraproject.org/pub/fedora/linux/releases/test/${ver}_Beta/"
  local alt_url="https://dl.fedoraproject.org/pub/fedora/linux/releases/test/${ver}/"

  if curl -sf --max-time 8 --head "$beta_url" 2>/dev/null | grep -q "200\|301\|302"; then
    echo "$beta_url"
    return 0
  fi

  if curl -sf --max-time 8 --head "$alt_url" 2>/dev/null | grep -q "200\|301\|302"; then
    echo "$alt_url"
    return 0
  fi

  if dnf system-upgrade download --releasever="$ver" --assumeno &>/dev/null 2>&1; then
    echo "dnf"
    return 0
  fi

  return 1
}

detect_best_version() {
  local current_ver="$1"
  local stable_ver=""
  local next_ver=$((current_ver + 1))

  log_info "Retrieving the latest stable version..."
  stable_ver=$(get_latest_stable_version || echo "")

  if [[ -z "$stable_ver" ]]; then
    stable_ver=$((current_ver + 1))
    log_warn "API unavailable, using fallback stable version: Fedora $stable_ver"
  else
    log_ok "Latest stable version detected: Fedora $stable_ver"
  fi

  local beta_ver=$((stable_ver + 1))

  log_beta "Checking for available beta versions (Fedora $beta_ver)..."

  local beta_url=""
  if beta_url=$(check_beta_exists "$beta_ver" 2>/dev/null); then
    log_beta "Beta version detected: Fedora $beta_ver"
    echo "beta:$beta_ver"
  else
    log_info "No beta version found for Fedora $beta_ver."
    echo "stable:$stable_ver"
  fi
}

show_system_info() {
  log_section "System Information"
  echo -e "  ${BOLD}OS         :${NC} $(cat /etc/fedora-release)"
  echo -e "  ${BOLD}Kernel     :${NC} $(uname -r)"
  echo -e "  ${BOLD}Date       :${NC} $(date '+%Y-%m-%d %H:%M:%S')"
}

show_beta_warning() {
  local ver="$1"
  echo -e "\n  ${MAGENTA}${BOLD}  ⚡ BETA VERSION — Fedora $ver${NC}"
  echo -e "  ${MAGENTA}┌──────────────────────────────────────────────────┐${NC}"
  echo -e "  ${MAGENTA}│${NC}  ⚠️  A beta version may contain critical bugs.     ${MAGENTA}│${NC}"
  echo -e "  ${MAGENTA}│${NC}  ⚠️  Not recommended for production environments.  ${MAGENTA}│${NC}"
  echo -e "  ${MAGENTA}│${NC}  ✅  Ideal for testing and contributing to Fedora. ${MAGENTA}│${NC}"
  echo -e "  ${MAGENTA}└──────────────────────────────────────────────────┘${NC}\n"
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
  log_section "Step 2/3 — Downloading Fedora $target_ver"

  if ! dnf system-upgrade download --releasever="$target_ver" -y; then
    log_warn "Conflicts detected, retrying with --allowerasing..."
    if ! dnf system-upgrade download --releasever="$target_ver" --allowerasing -y; then
      log_error "Download failed."
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
  FORCE_BETA=false
  FORCE_STABLE=false

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
      --beta)
        FORCE_BETA=true
        shift
        ;;
      --stable)
        FORCE_STABLE=true
        shift
        ;;
      --help|-h)
        echo "Usage: sudo $0 [OPTIONS]"
        echo ""
        echo "  Upgrade Fedora to the next version (stable or beta)."
        echo "  Automatically detects if a beta version is available."
        echo ""
        echo "Options:"
        echo "  --to, -t <ver>   Force a target version (e.g., --to 44)"
        echo "  --beta           Force upgrade to beta (current_stable + 1)"
        echo "  --stable         Force stable only, dismiss beta versions"
        echo "  --yes, -y        Skip confirmation before rebooting"
        echo "  --help, -h       Display this help message"
        echo ""
        echo "Examples:"
        echo "  sudo $0              # Auto-detect stable or beta"
        echo "  sudo $0 --beta       # Force beta if available"
        echo "  sudo $0 --stable     # Stable only"
        echo "  sudo $0 --to 44      # Force Fedora 44 (beta or stable)"
        exit 0
        ;;
      *)
        log_error "Unknown argument: $1. Please run with --help."
        exit 1
        ;;
    esac
  done
}

main() {
  echo -e "\n${BOLD}${CYAN}  fedora-upgrade-beta.sh${NC}${CYAN} — Stable & Beta Version Upgrader${NC}"
  echo -e "  ────────────────────────────────────────────────────────\n"

  parse_args "$@"
  check_root
  show_system_info

  local current_ver
  current_ver=$(get_current_version)

  local target_ver=""
  local channel="stable"

  if [[ -n "${TARGET_VERSION:-}" ]]; then
    target_ver="$TARGET_VERSION"
    log_info "Target version forced: Fedora $target_ver"

  elif [[ "${FORCE_STABLE:-false}" == "true" ]]; then
    target_ver=$(get_latest_stable_version || echo $((current_ver + 1)))
    channel="stable"
    log_ok "Stable mode forced: Fedora $target_ver"

  elif [[ "${FORCE_BETA:-false}" == "true" ]]; then
    local stable_ver
    stable_ver=$(get_latest_stable_version || echo "$current_ver")
    target_ver=$((stable_ver + 1))
    channel="beta"
    log_beta "Beta mode forced: Fedora $target_ver"

  else
    log_section "Detecting best available version"
    local detected
    detected=$(detect_best_version "$current_ver")
    channel=$(echo "$detected" | cut -d: -f1)
    target_ver=$(echo "$detected" | cut -d: -f2)
  fi

  if [[ "$target_ver" -le "$current_ver" ]]; then
    log_ok "You are already on the latest available version (Fedora $current_ver). No action required."
    exit 0
  fi

  if [[ "$channel" == "beta" ]]; then
    show_beta_warning "$target_ver"
    echo -e "  ${BOLD}Planned upgrade:${NC} Fedora ${CYAN}${current_ver}${NC} → Fedora ${MAGENTA}${target_ver} (beta)${NC}\n"
  else
    echo -e "\n  ${BOLD}Planned upgrade:${NC} Fedora ${CYAN}${current_ver}${NC} → Fedora ${GREEN}${target_ver} (stable)${NC}\n"
  fi

  if [[ "${AUTO_CONFIRM:-false}" == "false" ]]; then
    local label="stable"
    [[ "$channel" == "beta" ]] && label="${MAGENTA}BETA${NC}"
    read -r -p "  Please confirm the upgrade to Fedora $target_ver ($label) [y/N]: " confirm
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
