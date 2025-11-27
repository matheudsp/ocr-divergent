#!/bin/sh
set -e

echo "[OCR] Iniciando Entrypoint..."

# echo "[OCR] Aguardando Postgres..."
# until nc -z -v -w30 $DB_HOST $DB_PORT; do
#   echo "[OCR] Aguardando conexão com banco de dados..."
#   sleep 5
# done

echo "[OCR] Executando Migrations do Prisma..."
npx prisma migrate deploy

echo "[OCR] Iniciando a Aplicação..."
exec "$@"