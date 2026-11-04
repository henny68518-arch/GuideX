$root = $PSScriptRoot

# Start API
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root\Project\API\GuideX'; dotnet run --launch-profile http"
)

# Start Angular
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$root\Project\Angular'; npm start"
)
