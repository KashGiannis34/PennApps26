@echo off
echo Getting your current IP addresses...
echo.
echo === Wi-Fi Adapter Information ===
ipconfig | findstr /C:"Wireless LAN adapter Wi-Fi" /A:12
echo.
echo === IPv4 Addresses Found ===
ipconfig | findstr "IPv4 Address"
echo.
echo === Instructions ===
echo 1. Look for your Wi-Fi adapter's IPv4 Address above
echo 2. It should look like: 10.251.143.142 (your current setting)
echo 3. If it's different, update your .env file:
echo    EXPO_PUBLIC_LAPTOP_IP=your.new.ip.address
echo 4. Save and restart your Expo server
echo.
echo Current .env setting: EXPO_PUBLIC_LAPTOP_IP=10.251.143.142
echo.
pause