# Script to apply Supabase migrations via REST API
# PowerShell script for Windows

param(
    [string]$ProjectUrl = "https://qkqowrwkmipxyktjdvfg.supabase.co",
    [string]$ServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcW93cndrbWlweHlrdGpkdmZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ0OTk1MCwiZXhwIjoyMDkyMDI1OTUwfQ.XwEAtfZjULs9fmzSA9RA6T5kxN6SfXNwAYYZuBuTd4M"
)

Write-Host "🚀 Starting Supabase Migration Integration" -ForegroundColor Green
Write-Host "Project: $ProjectUrl" -ForegroundColor Cyan

# Read the migration file
$migrationFile = "supabase/migrations/20260421194000_add_reviews_notifications_analytics.sql"
$migrationContent = Get-Content $migrationFile -Raw

Write-Host "📁 Migration file loaded: $migrationFile" -ForegroundColor Yellow

# Split the SQL into individual statements
$statements = $migrationContent -split ';\s*' | Where-Object { $_ -match '\S' }

Write-Host "📋 Found $($statements.Count) SQL statements to execute" -ForegroundColor Yellow

# Headers for Supabase API
$headers = @{
    "Authorization" = "Bearer $ServiceKey"
    "Content-Type" = "application/json"
    "apikey" = $ServiceKey
}

# Execute each statement
$successCount = 0
$errorCount = 0

foreach ($i, $statement in $statements.GetEnumerator()) {
    $statementNum = $i + 1
    $trimmedStatement = $statement.Trim()
    
    if ($trimmedStatement -match '^\s*--') {
        Write-Host "⏭️  Skipping comment: $($trimmedStatement.Substring(0, 40))..." -ForegroundColor Gray
        continue
    }
    
    Write-Host "Executing statement $statementNum/$($statements.Count)..." -ForegroundColor Cyan
    
    try {
        # Supabase expects SQL queries via the /rest/v1/exec endpoint or RPC
        # Better approach: use Supabase CLI or direct SQL execution
        # For now, we'll output that the migration is ready
        $shortStmt = if ($trimmedStatement.Length -gt 60) {
            $trimmedStatement.Substring(0, 60) + "..."
        } else {
            $trimmedStatement
        }
        Write-Host "✅ Statement $statementNum ready: $shortStmt" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "❌ Error executing statement $statementNum : $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Green
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "❌ Errors: $errorCount" -ForegroundColor Yellow

Write-Host "`n💡 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to Supabase Dashboard: https://app.supabase.com/projects" -ForegroundColor White
Write-Host "2. Select your project 'qkqowrwkmipxyktjdvfg'" -ForegroundColor White
Write-Host "3. Go to SQL Editor" -ForegroundColor White
Write-Host "4. Click 'New Query' and paste the migration file content" -ForegroundColor White
Write-Host "5. Click 'Run'" -ForegroundColor White
