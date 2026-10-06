$paths = @(
    "src\lib\ai-kernel",
    "src\lib\ai-selector",
    "src\lib\art-direction",
    "src\lib\booking-engine",
    "src\lib\business-components",
    "src\lib\capability-engine",
    "src\lib\compatibility-engine",
    "src\lib\componentRegistry.js",
    "src\lib\connection-engine",
    "src\lib\creation-flow",
    "src\lib\delivery-engine",
    "src\lib\history-engine",
    "src\lib\inventory-engine",
    "src\lib\lead-engine",
    "src\lib\notification-engine",
    "src\lib\offline-builder",
    "src\lib\page-engine",
    "src\lib\quote-engine",
    "src\lib\responsive-engine",
    "src\lib\staff-engine",
    "src\lib\store-composer",
    "src\lib\store-model",
    "src\lib\versioning-engine"
)

foreach ($p in $paths) {
    if (Test-Path $p) {
        Remove-Item -Path $p -Recurse -Force
        Write-Output "DELETED: $p"
    }
}
