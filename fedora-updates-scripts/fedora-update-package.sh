#!/bin/bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()      { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }
log_section() { echo -e "\n${BOLD}${CYAN}=== $1 ===${NC}"; }

check_root() {
  if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root (sudo)."
    exit 1
  fi
}

show_system_info() {
  log_section "System Information"
  echo -e "  ${BOLD}OS      :${NC} $(cat /etc/fedora-release)"
  echo -e "  ${BOLD}Kernel  :${NC} $(uname -r)"
  echo -e "  ${BOLD}Uptime  :${NC} $(uptime -p)"
  echo -e "  ${BOLD}Date    :${NC} $(date '+%Y-%m-%d %H:%M:%S')"
}

check_available_updates() {
  log_section "Checking for Updates"
  log_info "Refreshing DNF metadata..."

  set +e
  dnf check-update --refresh > /tmp/dnf-check-output.txt 2>&1
  local exit_code=$?
  set -e

  if [[ $exit_code -eq 0 ]]; then
    log_ok "No updates available. The system is up to date."
    return 1
  elif [[ $exit_code -eq 100 ]]; then
    local count
    count=$(grep -cE "^\S" /tmp/dnf-check-output.txt || true)
    log_warn "${count} package(s) available for update."
    return 0
  else
    log_error "DNF error (code: $exit_code)."
    cat /tmp/dnf-check-output.txt
    exit 1
  fi
}

get_current_kernel() {
  uname -r
}

get_latest_installed_kernel() {
  rpm -q kernel --qf "%{VERSION}-%{RELEASE}.%{ARCH}\n" 2>/dev/null \
    | sort -V | tail -1
}

run_upgrade() {
  log_section "Performing Update"

  local kernel_before
  kernel_before=$(get_current_kernel)

  log_info "Executing dnf upgrade..."
  if dnf upgrade -y; then
    log_ok "Update completed successfully."

    local kernel_after
    kernel_after=$(get_latest_installed_kernel)

    echo ""
    if [[ "$kernel_before" != "$kernel_after" ]]; then
      echo -e "${YELLOW}${BOLD}  ⚡ New kernel detected.${NC}"
      echo -e "  ${BOLD}Before :${NC} $kernel_before"
      echo -e "  ${BOLD}After  :${NC} $kernel_after"
      echo -e "\n${YELLOW}  → A reboot is required to load the new kernel.${NC}"
      echo -e "${YELLOW}  → Please execute: ${BOLD}sudo reboot${NC}${YELLOW} when you are ready.${NC}"
    else
      log_ok "Kernel remains unchanged ($kernel_before). No reboot is required."
    fi
  else
    log_error "The update process failed."
    exit 1
  fi
}

main() {
  echo -e "\n${BOLD}${CYAN}  fedora-update.sh${NC}${CYAN} — Package & Kernel Updater${NC}"
  echo -e "  ──────────────────────────────────────\n"

  check_root
  show_system_info

  if check_available_updates; then
    run_upgrade
  fi

  echo ""
}

main
