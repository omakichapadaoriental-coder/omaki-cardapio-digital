@echo off
title Omaki Sushi - Reativar Entregas
color 0A
chcp 65001 >nul

echo ====================================================
echo       OMAKI SUSHI — REATIVAR ENTREGAS HOJE
echo ====================================================
echo.
echo Enviando comando para liberar entregas no servidor...
echo.

powershell -NoProfile -Command "try { $body = '{\"pin\":\"1234\",\"deliveryActive\":true,\"manualDeliveryOverride\":true,\"deliveryClosedReason\":\"\"}'; $r = Invoke-RestMethod -Uri 'https://omaki-cardapio-digital.vercel.app/api/status' -Method POST -Body $body -ContentType 'application/json'; Write-Host '>>> SUCESSO: Entregas LIBERADAS no cardapio online!' -ForegroundColor Green } catch { Write-Host '>>> ERRO ao conectar com o servidor: ' $_.Exception.Message -ForegroundColor Red }"

echo.
echo ====================================================
echo  Os clientes ja podem pedir via Delivery.
echo  (Limite automatico diario: 22:30)
echo ====================================================
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
