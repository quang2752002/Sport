param()
$filePath = "D:\Project\SprotHY\SportHY\API\API\Views\Home\Index.cshtml"
$lines = [System.IO.File]::ReadAllLines($filePath, [System.Text.Encoding]::UTF8)
$newLines = New-Object System.Collections.Generic.List[string]

$skip = $false
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]

    # Skip remaining comment for section 5
    if ($line.Contains("5. ") -or ($i -ge 345 -and $i -le 355 -and $line.Contains("<!-- =="))) {
        continue
    }

    # Skip let medalRankingsData and medalSearchQuery
    if ($line.Contains("medalRankingsData") -or $line.Contains("medalSearchQuery")) {
        continue
    }

    # Skip loadMedalRankings in ready
    if ($line.Contains("loadMedalRankings(")) {
        if (-not $skip -and -not $line.Contains("function loadMedalRankings")) {
            continue
        }
    }

    # Start skipping from medal ranking section comment or function
    if ($line.Contains("function loadMedalRankings") -or ($line.Contains("// ==") -and $i -gt 550 -and $i -lt 650)) {
        $skip = $true
    }

    # Stop skipping when formatDate is reached
    if ($skip -and ($line.Contains("function formatDate") -or ($line.Contains("// ==") -and $i -gt 800))) {
        $skip = $false
    }

    if (-not $skip) {
        $newLines.Add($line)
    }
}

[System.IO.File]::WriteAllLines($filePath, $newLines, [System.Text.Encoding]::UTF8)
Write-Host "Updated Index.cshtml with pure ASCII matching. Total lines now:" $newLines.Count
