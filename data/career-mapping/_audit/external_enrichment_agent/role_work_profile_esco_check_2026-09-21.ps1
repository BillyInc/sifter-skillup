$ErrorActionPreference = 'Stop'

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$repo = (Resolve-Path (Join-Path $here '..\..\..\..')).Path
$tracePath = Join-Path $repo 'data\career-mapping\_audit\subgroup_role_source_traceability_2026-08-31.json'
$occupationPath = Join-Path $repo 'data\career-mapping\_tax_src\esco\occupations_en.csv'
$outPath = Join-Path $here 'role_work_profile_esco_api_cache_2026-09-21.json'

$trace = Get-Content -Raw -LiteralPath $tracePath | ConvertFrom-Json
$occupations = Import-Csv -LiteralPath $occupationPath
$roles = @($trace.roles | Where-Object { $_.work_profile_status -eq 'not_available' } | Select-Object -First 20)
$results = @()

foreach ($role in $roles) {
    $local = $occupations | Where-Object {
        $_.code -eq $role.esco_code -and $_.preferredLabel.ToLowerInvariant() -eq $role.role_name.ToLowerInvariant()
    } | Select-Object -First 1
    if (-not $local) {
        $results += [pscustomobject]@{
            role_key = $role.role_key
            role_name = $role.role_name
            esco_code = $role.esco_code
            status = 'missing_repository_record'
        }
        continue
    }
    $url = 'https://ec.europa.eu/esco/api/resource/occupation?uri=' + $local.conceptUri
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $url -Headers @{ Accept = 'application/json' } -TimeoutSec 30
        $payload = $response.Content | ConvertFrom-Json
        $results += [pscustomobject]@{
            role_key = $role.role_key
            role_name = $role.role_name
            esco_code = $role.esco_code
            status = 'verified'
            http_status = $response.StatusCode
            api_url = $url
            api_title = [string]$payload.title
            api_uri = [string]$payload.uri
            api_description_en = [string]$payload.description.en.literal
            api_description_en_us = [string]$payload.description.'en-us'.literal
            local_preferred_label = [string]$local.preferredLabel
            local_concept_uri = [string]$local.conceptUri
        }
    } catch {
        $results += [pscustomobject]@{
            role_key = $role.role_key
            role_name = $role.role_name
            esco_code = $role.esco_code
            status = 'internet_check_failed'
            api_url = $url
            error = $_.Exception.Message
        }
    }
}

$payload = [pscustomobject]@{
    schema_version = '2026-09-21.role-work-profile-esco-api-cache.v1'
    retrieved_on = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    authority = 'European Commission ESCO REST API'
    api_documentation = 'https://ec.europa.eu/esco/api/doc/esco_api_doc.html'
    records = $results
}
$payload | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $outPath -Encoding utf8
Write-Output ("Wrote " + $results.Count + " API checks to " + $outPath)
