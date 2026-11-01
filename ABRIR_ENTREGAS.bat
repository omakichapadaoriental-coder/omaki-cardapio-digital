@echo off
title Omaki Sushi - Reativar Entregas
color 0A
chcp 65001 >nul

echo ====================================================
echo       OMAKI SUSHI — REATIVAR ENTREGAS HOJE
echo ====================================================
echo.
echo Enviando comando para reativar entregas no servidor...
echo.

node "%~dp0admin_toggle.js" open

echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
