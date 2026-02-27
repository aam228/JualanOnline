# Fix Port Connection Issue

## Problem
Frontend masih fetch ke port 5000, tapi backend sekarang di port 5001 (karena port 5000 dipake sama macOS ControlCenter).

## Solution

### 1. Stop Frontend Dev Server
Di terminal yang running `npm run dev` untuk frontend, tekan `Ctrl+C` untuk stop.

### 2. Restart Frontend
```bash
cd anjay
npm run dev
```

### 3. Verify
Setelah restart, frontend akan otomatis baca `.env` file yang sudah diupdate:
```
VITE_API_URL=http://localhost:5001/api
```

## Files Already Updated ✅
- `backend/.env` → PORT=5001
- `anjay/.env` → VITE_API_URL=http://localhost:5001/api
- `anjay/src/services/api.ts` → Sudah baca dari env variable

## Why This Happens
Vite caches environment variables saat startup. Jadi kalau `.env` diubah pas server running, harus restart dulu biar kebaca.

## Backend Status
Backend sudah jalan di port 5001 dan database sudah ada 6 products dengan 37 SKUs.
