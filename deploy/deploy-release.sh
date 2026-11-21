#!/usr/bin/env bash
# Izvaja se na Linux strežniku kot namenski uporabnik aplikacije.
# Prva ureditev strežnika je opisana v README; skripta ne ureja skrivnosti.
set -euo pipefail
umask 077
root=${1:?Manjka korenski direktorij}
release_id=${2:?Manjka identifikator izdaje}
service=${3:?Manjka ime storitve}
[[ "$root" =~ ^/[a-zA-Z0-9/_-]+$ && "$root" != / ]]
[[ "$release_id" =~ ^[a-zA-Z0-9_-]+$ ]]
[[ "$service" =~ ^[a-zA-Z0-9@_.-]+$ ]]
root=${root%/}
archive="$root/incoming/$release_id.tar.gz"
release="$root/releases/$release_id"
environment="$root/shared/.env"
test -f "$environment"
test -f "$archive"
test -d "$root/shared/backups"
test -d "$root/releases"
exec 9>"$root/shared/deploy.lock"
flock -n 9 || { echo 'Druga objava že poteka.' >&2; exit 1; }
node -e 'const [major,minor]=process.versions.node.split(".").map(Number);if(major!==24||minor<13)process.exit(1)'

# Preveri samo potrebne vrednosti. Celotnega okolja nikoli ne izpisuj.
# Produkcijska datoteka določa povezavo; profil SSH je ne sme preglasiti.
unset DATABASE_URL PORT PG_DUMP_BIN
port=$(node --env-file="$environment" -e 'process.stdout.write(process.env.PORT || "3000")')
[[ "$port" =~ ^[0-9]+$ ]]
node --env-file="$environment" --input-type=module - <<'NODE'
try {
  const url = new URL(process.env.DATABASE_URL || '');
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error();
} catch {
  throw new Error('DATABASE_URL mora kazati na trajni strežnik PostgreSQL.');
}
NODE

previous=''
if [ -L "$root/current" ]; then previous=$(readlink -f "$root/current"); fi
mkdir "$release"
tar -xzf "$archive" -C "$release"
ln -s "$environment" "$release/.env"
cd "$release"
npm ci --omit=dev

# pg_dump izdela konsistentno kopijo v custom formatu. PostgreSQL teče
# neodvisno od izdaj; produkcijskega .env ali podatkovnega direktorija ne menjamo.
npm run db:backup -- "$root/shared/backups/pre-$release_id.dump"

activate() {
  ln -s "$1" "$root/.current-$release_id"
  mv -Tf "$root/.current-$release_id" "$root/current"
}
healthy() {
  curl --fail --silent --max-time 3 "http://127.0.0.1:$port/api/health" |
    node -e 'let s="";process.stdin.on("data",b=>s+=b);process.stdin.on("end",()=>{try{if(JSON.parse(s).status!=="ok")process.exit(1)}catch{process.exit(1)}})'
}
rollback() {
  if [ -n "$previous" ]; then
    echo 'Preverjanje ni uspelo. Vračam prejšnjo izdajo; baze ne prepisujem.' >&2
    activate "$previous"
    sudo -n systemctl restart "$service"
  else
    echo 'Prva objava ni uspela; prejšnje izdaje ni. Preveri dnevnik storitve.' >&2
    sudo -n systemctl stop "$service" || true
  fi
}

activate "$release"
if ! sudo -n systemctl restart "$service"; then rollback; exit 1; fi
for attempt in {1..20}; do
  if healthy; then
    echo "Izdaja $release_id deluje; zdravstveni pregled je uspel."
    exit 0
  fi
  sleep 1
done
rollback
exit 1
