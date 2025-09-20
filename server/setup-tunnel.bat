@echo off
echo Setting up ngrok tunnel for Express server...
echo.
echo Step 1: Make sure your Express server is running on port 3001
echo Step 2: Download ngrok from https://ngrok.com/download if you haven't already
echo Step 3: Run the command below in a new terminal:
echo.
echo    ngrok http 3001
echo.
echo Step 4: Copy the HTTPS URL from ngrok output (looks like: https://abc123.ngrok.io)
echo Step 5: Add this line to your .env file in the project root:
echo.
echo    EXPO_PUBLIC_SERVER_URL=https://your-ngrok-url.ngrok.io
echo.
echo Step 6: Restart your Expo app
echo.
echo Current .env file location: %CD%\..\..env
echo.
pause