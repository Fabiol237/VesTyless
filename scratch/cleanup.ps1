$paths = @(
    "src\lib\blockEngine",
    "src\lib\blockPatcher.js",
    "src\lib\builder",
    "src\lib\developer-mode",
    "src\lib\composition-engine",
    "src\lib\component-libraries",
    "src\lib\component-registry",
    "src\lib\design-intelligence",
    "src\lib\template-packages",
    "src\lib\template-library",
    "src\lib\headers",
    "src\lib\storeBlocks.js",
    "src\blocks",
    "src\components\blocks",
    "src\components\builder",
    "src\components\developer-mode",
    "src\components\dynamic-dashboard",
    "src\components\editor-shell",
    "src\components\page-manager",
    "src\components\store-composer",
    "src\components\template-library",
    "src\components\template-packages",
    "src\components\visual-engine",
    "src\app\builder",
    "src\app\headers-gallery",
    "src\app\dashboard-preview"
)

foreach ($p in $paths) {
    if (Test-Path $p) {
        Remove-Item -Path $p -Recurse -Force
        Write-Output "DELETED: $p"
    }
}
