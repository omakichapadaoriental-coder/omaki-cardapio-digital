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

node "%~dp0admin_toggle.js" pause

echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
