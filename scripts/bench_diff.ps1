<#
.SYNOPSIS
    Diff two summary CSVs produced by bench_shell_present.ps1 and print
    the deltas. Use to compare a `before` baseline (on main) against an
    `after` run (on shell/optimization).

.PARAMETER Before
    Path to the baseline summary CSV (e.g. before_summary.csv).

.PARAMETER After
    Path to the post-change summary CSV.

.PARAMETER Markdown
    If set, emits a small markdown table suitable for pasting into
    docs/roadmap/shell-optimization-status.md.

.EXAMPLE
    .\scripts\bench_diff.ps1 -Before docs\roadmap\bench\before_summary.csv `
                              -After  docs\roadmap\bench\after_summary.csv -Markdown
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)] [string] $Before,
    [Parameter(Mandatory=$true)] [string] $After,
    [switch] $Markdown
)

$ErrorActionPreference = "Stop"
if (-not (Test-Path $Before)) { throw "Before CSV not found: $Before" }
if (-not (Test-Path $After))  { throw "After  CSV not found: $After"  }

$b = (Import-Csv -LiteralPath $Before)[0]
$a = (Import-Csv -LiteralPath $After)[0]

# Numeric columns to diff. Keep stringy ones (zc_per_client, tag) out of the math.
$nsCols  = @("present_p50_ns","present_p95_ns","present_p99_ns","present_min_ns","present_max_ns","present_mean_ns","present_jitter_ns_p99_minus_p50")
$intCols = @("present_samples","mutex_windows","mutex_total_timeouts","mutex_total_acquires")
$floatCols = @("mutex_avg_acquire_us")

function Pct {
    param([double] $before, [double] $after)
    if ($before -eq 0) { return "n/a" }
    $delta = ($after - $before) / $before * 100.0
    $sign = if ($delta -ge 0) { "+" } else { "" }
    return ("{0}{1:F1}%" -f $sign, $delta)
}

function FmtNs { param([int64] $v) "{0:N0} ns ({1:N3} ms)" -f $v, ($v / 1e6) }

if ($Markdown) {
    "| metric | before ($($b.tag)) | after ($($a.tag)) | delta |"
    "|---|---|---|---|"
    foreach ($c in $nsCols) {
        $bv = [int64]$b.$c; $av = [int64]$a.$c
        "| $c | $(FmtNs $bv) | $(FmtNs $av) | $(Pct $bv $av) |"
    }
    foreach ($c in $intCols) {
        $bv = [int]$b.$c; $av = [int]$a.$c
        "| $c | $bv | $av | $(Pct $bv $av) |"
    }
    foreach ($c in $floatCols) {
        $bv = [double]$b.$c; $av = [double]$a.$c
        "| $c | $bv | $av | $(Pct $bv $av) |"
    }
    "| zc_per_client | $($b.zc_per_client) | $($a.zc_per_client) | — |"
} else {
    Write-Host "before tag: $($b.tag)   after tag: $($a.tag)"
    Write-Host ""
    foreach ($c in $nsCols) {
        $bv = [int64]$b.$c; $av = [int64]$a.$c
        "{0,-40}  before={1,-30}  after={2,-30}  delta={3}" -f $c, (FmtNs $bv), (FmtNs $av), (Pct $bv $av)
    }
    foreach ($c in $intCols) {
        $bv = [int]$b.$c; $av = [int]$a.$c
        "{0,-40}  before={1,-30}  after={2,-30}  delta={3}" -f $c, $bv, $av, (Pct $bv $av)
    }
    foreach ($c in $floatCols) {
        $bv = [double]$b.$c; $av = [double]$a.$c
        "{0,-40}  before={1,-30}  after={2,-30}  delta={3}" -f $c, $bv, $av, (Pct $bv $av)
    }
    Write-Host ""
    Write-Host "zc_per_client (before): $($b.zc_per_client)"
    Write-Host "zc_per_client (after) : $($a.zc_per_client)"
}
