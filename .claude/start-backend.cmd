@echo off
set PATH=C:\Program Files\nodejs;C:\Users\bruno\AppData\Roaming\npm;%PATH%
cd /d "C:\Users\bruno\Downloads\truthcalories-v1_0_7"
set NODE_ENV=development
node node_modules\.pnpm\tsx@4.21.0\node_modules\tsx\dist\cli.mjs watch server\_core\index.ts
