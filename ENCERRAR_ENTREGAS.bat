@echo off
title Omaki Sushi - Encerrar Entregas
color 0C
chcp 65001 >nul

echo ====================================================
echo       OMAKI SUSHI — ENCERRAR ENTREGAS HOJE
echo ====================================================
echo.
echo Enviando comando para pausar entregas no servidor...
echo.

powershell -NoProfile -Command "try { $body = '{\"pin\":\"1234\",\"deliveryActive\":false,\"manualDeliveryOverride\":false,\"deliveryClosedReason\":\"Pausado pelo Caixa\"}'; $r = Invoke-RestMethod -Uri 'https://omaki-cardapio-digital.vercel.app/api/status' -Method POST -Body $body -ContentType 'application/json'; Write-Host '>>> SUCESSO: Entregas PAUSADAS no cardapio online!' -ForegroundColor Green } catch { Write-Host '>>> ERRO ao conectar com o servidor: ' $_.Exception.Message -ForegroundColor Red }"

echo.
echo ====================================================
echo  A partir de agora o cardapio aceita apenas RETIRADA.
echo  (Limite automatico diario: 22:30)
echo ====================================================
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
