#!/bin/bash
set -e
cd /volume1/docker/algorithms
echo '>>> 重建 frontend 镜像'
docker compose build frontend
echo '>>> 重启 frontend 服务'
docker compose up -d frontend
echo '>>> 服务状态'
docker compose ps frontend
