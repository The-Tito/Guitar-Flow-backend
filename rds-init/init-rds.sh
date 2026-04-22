#!/usr/bin/env bash
# =============================================================================
# init-rds.sh — Inicializa la base de datos RDS con los scripts de Guitar-Flow-infra
# =============================================================================
# Requisitos:
#   - psql instalado localmente (o ejecutar desde EC2)
#   - Acceso de red al endpoint de RDS (Security Group abierto desde tu IP)
#   - Tener clonado Guitar-Flow-infra en ../Guitar-Flow-infra
#
# Uso:
#   chmod +x init-rds.sh
#   ./init-rds.sh
# =============================================================================
set -euo pipefail

# ─── Configuración — edita estos valores ──────────────────────────────────
RDS_HOST="database-1.cluster-ck80hqbvnarg.us-east-1.rds.amazonaws.com"   # ← endpoint de tu RDS
RDS_PORT="5432"
POSTGRES_USER="postgres_admin"           # ← superusuario que creaste en RDS
POSTGRES_DB="guitarflow"
SCRIPTS_DIR="../Guitar-Flow-infra/scripts"
# ──────────────────────────────────────────────────────────────────────────

echo "════════════════════════════════════════"
echo "  Guitar Flow — Init RDS"
echo "════════════════════════════════════════"

# Solicitar password de forma segura
read -rsp "Password para ${POSTGRES_USER}@${RDS_HOST}: " PGPASSWORD
echo ""
export PGPASSWORD

# ─────────────────────────────────────────────────────────────────────────────
# Verificar conexión
# ─────────────────────────────────────────────────────────────────────────────
echo "▶ Verificando conexión a RDS..."
psql -h "$RDS_HOST" -p "$RDS_PORT" -U "$POSTGRES_USER" -d "postgres" \
  -c "SELECT version();" > /dev/null \
  && echo "✅ Conexión exitosa" \
  || (echo "❌ No se pudo conectar a RDS" && exit 1)

# ─────────────────────────────────────────────────────────────────────────────
# Crear base de datos (si no existe)
# ─────────────────────────────────────────────────────────────────────────────
echo "▶ Creando base de datos '${POSTGRES_DB}' (si no existe)..."
psql -h "$RDS_HOST" -p "$RDS_PORT" -U "$POSTGRES_USER" -d "postgres" \
  -tc "SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'" \
  | grep -q 1 \
  || psql -h "$RDS_HOST" -p "$RDS_PORT" -U "$POSTGRES_USER" -d "postgres" \
       -c "CREATE DATABASE ${POSTGRES_DB};"

# ─────────────────────────────────────────────────────────────────────────────
# Ejecutar scripts en orden
# IMPORTANTE: 06_musical_theory_logic.sql se salta (duplicado de 02b)
# ─────────────────────────────────────────────────────────────────────────────
echo "▶ Ejecutando scripts de inicialización..."

SKIP_SCRIPTS=("06_musical_theory_logic.sql")  # ⚠️ duplicado detectado

run_sql() {
  local file="$1"
  echo "   → $(basename "$file")"
  psql -h "$RDS_HOST" -p "$RDS_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -f "$file" -v ON_ERROR_STOP=1
}

run_sh() {
  local file="$1"
  echo "   → $(basename "$file") (shell)"
  # Los .sh del proyecto asumen que están dentro del contenedor Postgres.
  # Para RDS los adaptamos: extraemos los comandos psql y los ejecutamos directamente.
  # El script 00_create_roles.sh y 08_grants.sh crean roles y permisos — los traducimos.
  bash "$file" "$RDS_HOST" "$RDS_PORT" "$POSTGRES_USER" "$POSTGRES_DB"
}

for script in $(ls "$SCRIPTS_DIR" | sort); do
  # Saltar scripts duplicados
  if [[ " ${SKIP_SCRIPTS[*]} " =~ " ${script} " ]]; then
    echo "   ⚠️  Saltando ${script} (duplicado)"
    continue
  fi

  full_path="${SCRIPTS_DIR}/${script}"
  ext="${script##*.}"

  if [[ "$ext" == "sql" ]]; then
    run_sql "$full_path"
  elif [[ "$ext" == "sh" ]]; then
    run_sh "$full_path"
  fi
done

echo ""
echo "✅ Base de datos inicializada correctamente"
echo ""
echo "  Verifica con:"
echo "  psql -h ${RDS_HOST} -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c '\\dt'"

unset PGPASSWORD
