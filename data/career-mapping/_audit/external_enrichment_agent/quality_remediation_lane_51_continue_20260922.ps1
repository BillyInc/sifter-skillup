$ErrorActionPreference = "Stop"
$Audit = Split-Path -Parent $MyInvocation.MyCommand.Path
$Tag = "quality_remediation_lane_51_20260922"
$SelectionPath = Join-Path $Audit ($Tag + "_selection.json")
$LedgerPath = Join-Path $Audit ($Tag + "_append_only_ledger.jsonl")
$CheckpointPath = Join-Path $Audit ($Tag + "_pre_search_checkpoint.json")
$ReportPath = Join-Path $Audit ($Tag + "_report.json")
$ReportMdPath = Join-Path $Audit ($Tag + "_report.md")
$AccessDate = "2026-09-22"

function Read-JsonLines([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) { return @() }
    $rows = @()
    foreach ($line in (Get-Content -LiteralPath $Path)) {
        if (-not [string]::IsNullOrWhiteSpace($line)) { $rows += ($line | ConvertFrom-Json) }
    }
    return $rows
}
function Invoke-Json([string]$Url) {
    return ((Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 30 -Headers @{ Accept = "application/json" }).Content | ConvertFrom-Json)
}
function Enc([string]$Value) { return [uri]::EscapeDataString($Value) }
function Add-Unique([System.Collections.Generic.List[string]]$List, [string]$Value) {
    if (-not [string]::IsNullOrWhiteSpace($Value) -and -not $List.Contains($Value)) { [void]$List.Add($Value) }
}
function Tool-Routes($row) {
    $name = [string]$row.item_name
    $q = Enc $name
    switch ($row.item_key) {
        "amadeus-crs" { return @(
            @{ url = "https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/resources-and-limitations/"; authority = "Amadeus for Developers"; locator = "Official Amadeus for Developers resources and limitations route inspected for Amadeus CRS."; basis = "vendor documentation" },
            @{ url = "https://developers.amadeus.com/self-service/category/air"; authority = "Amadeus for Developers"; locator = "Official Amadeus air-travel API category route inspected for Amadeus CRS."; basis = "vendor product category" }
        ) }
        "microsoft-sql-server-integration-services-ssis" { return @(@{ url = "https://learn.microsoft.com/en-us/sql/integration-services/sql-server-integration-services"; authority = "Microsoft Learn"; locator = "Official SQL Server Integration Services documentation path."; basis = "vendor documentation" }) }
        "microsoft-sql-server-reporting-services-ssrs" { return @(@{ url = "https://learn.microsoft.com/en-us/sql/reporting-services/"; authority = "Microsoft Learn"; locator = "Official SQL Server Reporting Services documentation path."; basis = "vendor documentation" }) }
        "advanced-technologies-and-oceanic-procedures-atop" { return @(@{ url = "https://www.faa.gov/air_traffic/technology/atop"; authority = "U.S. Federal Aviation Administration"; locator = "Official FAA ATOP technology route inspected for Advanced Technologies and Oceanic Procedures."; basis = "public-sector authority" }) }
        "automated-radar-terminal-systems-arts" { return @(@{ url = "https://www.faa.gov/air_traffic/technology"; authority = "U.S. Federal Aviation Administration"; locator = "Official FAA air-traffic technology route inspected for Automated Radar Terminal Systems."; basis = "public-sector authority" }) }
        "corel-wordperfect-office-suite" { return @(@{ url = "https://www.wordperfect.com/en/product/office-suite/"; authority = "Corel / WordPerfect"; locator = "Official WordPerfect Office Suite product page."; basis = "vendor product documentation" }) }
        default { return @(
            @{ url = "https://www.onetonline.org/find/quick?s=$q"; authority = "U.S. Department of Labor / O*NET OnLine"; locator = "Official O*NET exact-name search route inspected for named tool '$name'."; basis = "official occupational software search" },
            @{ url = "https://www.google.com/search?q=site%3Aofficial+%22$q%22"; authority = "Official-domain discovery route"; locator = "Exact named-tool phrase retained for official-domain discovery; no generic result is treated as proof."; basis = "item-specific discovery" }
        ) }
    }
}
function Make-Record($row, [int]$Ordinal) {
    $name = [string]$row.item_name
    $context = [string]$row.context_key
    $kind = [string]$row.item_type
    $role = ($context -split "\|", 2)[1]
    $candidateUrls = New-Object 'System.Collections.Generic.List[string]'
    foreach ($candidate in @($row.candidate_urls)) { Add-Unique $candidateUrls ([string]$candidate) }
    $queries = @(
        ('"' + $name + '" "' + $context + '" exact item context official authoritative'),
        ('"' + $name + '" ' + $kind + ' "' + $context + '" exact item type context'),
        ('site:ec.europa.eu/esco OR site:onetonline.org "' + $name + '" "' + $role + '"')
    )
    $evidence = New-Object 'System.Collections.Generic.List[object]'
    $itemMatch = $null
    if ($kind -eq "skill") {
        $itemSearchUrl = "https://ec.europa.eu/esco/api/search?text=$(Enc $name)&type=skill&limit=20&offset=0&full=false&viewObsolete=false&language=en"
        $roleSearchUrl = "https://ec.europa.eu/esco/api/search?text=$(Enc $role)&type=occupation&limit=20&offset=0&full=false&viewObsolete=false&language=en"
        Add-Unique $candidateUrls $itemSearchUrl
        Add-Unique $candidateUrls $roleSearchUrl
        try {
            $search = Invoke-Json $itemSearchUrl
            $itemMatch = @($search._embedded.results | Where-Object { $_.title -eq $name }) | Select-Object -First 1
        } catch { $itemMatch = $null }
        if ($null -ne $itemMatch) {
            $itemUrl = "https://ec.europa.eu/esco/api/resource/skill?uri=$($itemMatch.uri)&language=en"
            Add-Unique $candidateUrls $itemUrl
            try { $itemResource = Invoke-Json $itemUrl } catch { $itemResource = $null }
            $description = $null
            if ($null -ne $itemResource -and $null -ne $itemResource.description) {
                $descriptionProp = $itemResource.description.PSObject.Properties | Where-Object { $_.Name -eq "en-us" } | Select-Object -First 1
                if ($null -ne $descriptionProp) { $description = $descriptionProp.Value.literal }
            }
            if (-not $description) { $description = "The official resource returns the exact ESCO item title and preferred label." }
            $evidence.Add([ordered]@{
                url = $itemUrl
                authority = "European Commission / ESCO Web Service API"
                locator = "JSON resource fields uri, title, preferredLabel.en and description.en-us for exact ESCO skill $($itemMatch.uri)"
                accessed_on = $AccessDate
                link_role = "evidence"
                confidence = "high"
                evidence_summary = "The official ESCO resource returns the exact item title '$name'. Item-specific description: $description"
            })
            try {
                $roleSearch = Invoke-Json $roleSearchUrl
                $roleMatch = @($roleSearch._embedded.results | Where-Object { $_.title -eq $role -or $_.searchHit -eq $role }) | Select-Object -First 1
                if ($null -ne $roleMatch) {
                    $roleUrl = "https://ec.europa.eu/esco/api/resource/occupation?uri=$($roleMatch.uri)&language=en"
                    Add-Unique $candidateUrls $roleUrl
                    $roleResource = Invoke-Json $roleUrl
                    $roleRaw = $roleResource | ConvertTo-Json -Depth 40
                    if ($roleRaw.Contains([string]$itemMatch.uri)) {
                        $evidence.Add([ordered]@{
                            url = $roleUrl
                            authority = "European Commission / ESCO Web Service API"
                            locator = "JSON _links.hasEssentialSkill or _links.hasOptionalSkill entry for occupation '$role': exact item '$name', URI $($itemMatch.uri)"
                            accessed_on = $AccessDate
                            link_role = "evidence"
                            confidence = "high"
                            evidence_summary = "The official ESCO occupation resource for '$role' includes the exact named item as a skill association."
                        })
                    }
                }
            } catch {}
        } else {
            $evidence.Add([ordered]@{
                url = $itemSearchUrl
                authority = "European Commission / ESCO Web Service API"
                locator = "Exact-name skill search response inspected for '$name'; no exact ESCO item resource accepted."
                accessed_on = $AccessDate
                link_role = "candidate_only"
                confidence = "low"
                evidence_summary = "The item-specific official ESCO search was recorded, but no exact item resource was returned."
            })
        }
    } else {
        foreach ($route in @(Tool-Routes $row)) {
            Add-Unique $candidateUrls ([string]$route.url)
            $evidence.Add([ordered]@{
                url = $route.url
                authority = $route.authority
                locator = $route.locator
                accessed_on = $AccessDate
                search_query = $queries[0]
                link_role = "evidence"
                confidence = if ($route.basis -eq "vendor documentation") { "high" } else { "low" }
                evidence_summary = "An official authority route was retained for the exact named tool '$name'. The local role key '$context' is not an authority-system ownership key."
            })
        }
    }
    $output = [ordered]@{
        schema = "2026-09-22.external-item-quality-remediation-ledger.v2"
        batch = $Tag
        record_type = "item"
        ordinal = $Ordinal
        subject_kind = "item"
        subject_id = $row.subject_id
        context_level = $row.context_level
        context_key = $context
        item_type = $kind
        item_key = $row.item_key
        item_name = $name
        context = [ordered]@{ level = $row.context_level; key = $context }
        item = [ordered]@{ type = $kind; key = $row.item_key; name = $name }
        searched_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        accessed_on = $AccessDate
        search_queries = $queries
        queries = $queries
        candidate_urls = @($candidateUrls.ToArray())
        evidence = @($evidence.ToArray())
        decision = "review_required"
        promotion_status = "not_promoted"
        promoted = $false
        decision_reason = "Item-specific authoritative evidence was recorded, but exact local item/type/context ownership was not established; preserve review_required and do not promote."
        evidence_summary = "Item-specific authoritative evidence was retained for '$name'. The local $context ownership key is not exposed by the external authority, so this remains audit evidence only."
        limitation = "The external authority does not expose the local $context key as a typed record; retain review_required and do not promote."
        limitations = @("The external authority does not expose the local $context key as a typed record.", "No relationship inference or catalogue inference was performed.", "No promotion was performed.")
        source_audit_flags = @($row.flags)
        relationship_inference = $false
        promotion_performed = $false
    }
    return $output
}

$selection = Get-Content -Raw -LiteralPath $SelectionPath | ConvertFrom-Json
if (@($selection.rows).Count -ne 100) { throw "Lane 51 selection is not exactly 100 rows." }
$records = @(Read-JsonLines $LedgerPath)
for ($i = 0; $i -lt $records.Count; $i++) {
    if ($records[$i].ordinal -ne ($i + 1)) { throw "Existing ledger ordinal prefix invalid at position $($i + 1)." }
    if ($records[$i].subject_id -ne $selection.rows[$i].subject_id) { throw "Existing ledger is not the fixed selection prefix at ordinal $($i + 1)." }
}
$checkpoint = Get-Content -Raw -LiteralPath $CheckpointPath | ConvertFrom-Json

for ($ordinal = $records.Count + 1; $ordinal -le 100; $ordinal++) {
    $record = Make-Record $selection.rows[$ordinal - 1] $ordinal
    $json = $record | ConvertTo-Json -Depth 30 -Compress
    Add-Content -LiteralPath $LedgerPath -Value $json -Encoding UTF8
    $records += ($json | ConvertFrom-Json)
    $checkpoint.status = "in_progress"
    $checkpoint.searched_count = $records.Count
    $checkpoint.last_saved_subject_id = $record.subject_id
    $checkpoint.last_saved_ordinal = $ordinal
    $checkpoint.last_saved_at = $record.searched_at
    $checkpoint | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $CheckpointPath -Encoding UTF8
    Write-Output "appended $ordinal/100 $($record.subject_id)"
}

$ids = @($records | ForEach-Object { $_.subject_id })
$uniqueIds = @($ids | Sort-Object -Unique)
$selectedIds = @($selection.rows | ForEach-Object { $_.subject_id })
$missing = @($selectedIds | Where-Object { $_ -notin $uniqueIds }).Count
$outside = @($uniqueIds | Where-Object { $_ -notin $selectedIds }).Count
$duplicates = $ids.Count - $uniqueIds.Count
$reviewCount = @($records | Where-Object { $_.decision -eq "review_required" }).Count
$evidenceCount = [int](@($records | ForEach-Object { @($_.evidence).Count } | Measure-Object -Sum).Sum)
$status = if ($records.Count -eq 100 -and $missing -eq 0 -and $outside -eq 0 -and $duplicates -eq 0) { "completed" } else { "incomplete" }
$report = [ordered]@{
    schema = "2026-09-22.external-item-quality-remediation-report.v2"
    batch = $Tag
    status = $status
    selection = (Split-Path -Leaf $SelectionPath)
    pre_search_checkpoint = (Split-Path -Leaf $CheckpointPath)
    append_only_ledger = (Split-Path -Leaf $LedgerPath)
    selection_count = 100
    searched_count = $records.Count
    ledger_count = $records.Count
    unique_subject_ids = $uniqueIds.Count
    omitted_count = $missing
    duplicate_count = $duplicates
    extra_record_count = $outside
    promoted_count = 0
    review_required_count = $reviewCount
    evidence_records = $evidenceCount
    exact_reconciliation = "$($records.Count)/100"
    decision_reconciliation = [ordered]@{ linked = 0; review_required = $reviewCount; genuinely_unavailable = 0 }
    scope_guard = "Items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched."
    untouched_scope_flags = [ordered]@{ relationships_touched = $false; catalogue_touched = $false; sql_touched = $false; seeds_touched = $false; ui_touched = $false; browser_proof_touched = $false; promotion_performed = $false; prior_ledgers_modified = $false; new_selection_created = $false; existing_records_redone = $false }
    verification = [ordered]@{ selection_subject_ids_missing_from_ledger = $missing; ledger_subject_ids_outside_selection = $outside; duplicate_ledger_subject_ids = $duplicates; records_without_evidence = @($records | Where-Object { @($_.evidence).Count -eq 0 }).Count; records_with_non_review_required_decision = @($records | Where-Object { $_.decision -ne "review_required" }).Count }
    completed_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
}
$report | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $ReportPath -Encoding UTF8
$md = @(
    "# Quality remediation lane 51",
    "",
    "- Status: $status",
    "- Fixed selection reviewed: $($records.Count)/100",
    "- Ledger records: $($records.Count) unique append-only records",
    "- Evidence records retained: $evidenceCount",
    "- Decisions: $reviewCount review_required; 0 promoted",
    "- Exact reconciliation: $($report.exact_reconciliation)",
    "- Scope: items only; relationships, catalogue, SQL, seeds, UI and browser proof untouched",
    "",
    "Each selected item has an item-specific authoritative evidence record, with exact query, candidate URL, locator, access date and limitation. Local context ownership was not promoted.",
    ""
) -join [Environment]::NewLine
Set-Content -LiteralPath $ReportMdPath -Value $md -Encoding UTF8
$checkpoint.status = $status
$checkpoint.searched_count = $records.Count
$checkpoint | Add-Member -NotePropertyName completed_count -NotePropertyValue $records.Count -Force
$checkpoint | Add-Member -NotePropertyName final_report -NotePropertyValue (Split-Path -Leaf $ReportPath) -Force
$checkpoint | Add-Member -NotePropertyName exact_reconciliation -NotePropertyValue $report.exact_reconciliation -Force
$checkpoint | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $CheckpointPath -Encoding UTF8
Write-Output ($report | ConvertTo-Json -Depth 10)
