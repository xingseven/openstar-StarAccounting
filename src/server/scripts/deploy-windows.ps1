[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$AppDir,
  [string]$Branch = "main",
  [string]$RemoteName = "origin",
  [string]$ServerProcessName = "openstar-server",
  [string]$WebProcessName = "openstar-web",
  [string]$ServerHealthcheckUrl = "http://127.0.0.1:3006/api/health",
  [string]$WebHealthcheckUrl = "http://127.0.0.1:3000/",
  [int]$WaitSeconds = 60
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Write-DeployLog {
  param([string]$Message)
  Write-Host "[deploy] $Message"
}

function Resolve-Command {
  param([string[]]$Candidates)

  foreach ($candidate in $Candidates) {
    $command = Get-Command $candidate -ErrorAction SilentlyContinue
    if ($command) {
      return $command.Source
    }
  }

  throw "Missing required command: $($Candidates -join ', ')"
}

function Invoke-Native {
  param(
    [string]$FilePath,
    [string[]]$Arguments = @(),
    [string]$WorkingDirectory = (Get-Location).Path
  )

  Push-Location $WorkingDirectory
  try {
    Write-DeployLog "$FilePath $($Arguments -join ' ')"
    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "Command failed with exit code $LASTEXITCODE: $FilePath $($Arguments -join ' ')"
    }
  } finally {
    Pop-Location
  }
}

function Wait-ForHttp {
  param(
    [string]$Url,
    [string]$Label
  )

  for ($i = 1; $i -le $WaitSeconds; $i++) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
        Write-DeployLog "$Label is healthy: $Url"
        return
      }
    } catch {
    }

    Start-Sleep -Seconds 1
  }

  throw "$Label did not become healthy within ${WaitSeconds}s: $Url"
}

function Ensure-CleanWorktree {
  param([string]$RepositoryDir)

  Push-Location $RepositoryDir
  try {
    $status = & $script:GitBin status --porcelain
    if ($LASTEXITCODE -ne 0) {
      throw "Failed to inspect git status."
    }
    if ($status) {
      throw "Git working tree is dirty. Refusing to deploy."
    }
  } finally {
    Pop-Location
  }
}

function Checkout-DeployBranch {
  param([string]$RepositoryDir)

  Push-Location $RepositoryDir
  try {
    & $script:GitBin rev-parse --verify "refs/heads/$Branch" *> $null
    if ($LASTEXITCODE -eq 0) {
      Invoke-Native -FilePath $script:GitBin -Arguments @("checkout", $Branch) -WorkingDirectory $RepositoryDir
    } else {
      Invoke-Native -FilePath $script:GitBin -Arguments @("checkout", "-B", $Branch, "$RemoteName/$Branch") -WorkingDirectory $RepositoryDir
    }
  } finally {
    Pop-Location
  }
}

function Ensure-Pm2Process {
  param(
    [string]$Name,
    [string]$WorkingDirectory
  )

  $processListRaw = & $script:Pm2Bin jlist
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to read pm2 process list."
  }

  $processList = @()
  if ($processListRaw) {
    $processList = @($processListRaw | ConvertFrom-Json)
  }

  $existing = $processList | Where-Object { $_.name -eq $Name }
  if ($existing) {
    Invoke-Native -FilePath $script:Pm2Bin -Arguments @("restart", $Name, "--update-env")
  } else {
    Invoke-Native -FilePath $script:Pm2Bin -Arguments @("start", $script:NpmBin, "--name", $Name, "--cwd", $WorkingDirectory, "--", "start")
  }
}

$script:GitBin = Resolve-Command @("git.exe", "git")
$script:NodeBin = Resolve-Command @("node.exe", "node")
$script:NpmBin = Resolve-Command @("npm.cmd", "npm")
$script:NpxBin = Resolve-Command @("npx.cmd", "npx")
$script:Pm2Bin = Resolve-Command @("pm2.cmd", "pm2")

$ResolvedAppDir = (Resolve-Path -LiteralPath $AppDir).Path
$ServerDir = Join-Path $ResolvedAppDir "src\server"
$WebDir = Join-Path $ResolvedAppDir "web"

if (-not (Test-Path -LiteralPath (Join-Path $ResolvedAppDir ".git"))) {
  throw "Repository root not found: $ResolvedAppDir"
}
if (-not (Test-Path -LiteralPath $ServerDir)) {
  throw "Missing backend directory: $ServerDir"
}
if (-not (Test-Path -LiteralPath $WebDir)) {
  throw "Missing frontend directory: $WebDir"
}

Ensure-CleanWorktree -RepositoryDir $ResolvedAppDir
Invoke-Native -FilePath $script:GitBin -Arguments @("fetch", $RemoteName, "--prune") -WorkingDirectory $ResolvedAppDir
Checkout-DeployBranch -RepositoryDir $ResolvedAppDir
Invoke-Native -FilePath $script:GitBin -Arguments @("pull", "--ff-only", $RemoteName, $Branch) -WorkingDirectory $ResolvedAppDir

Write-DeployLog "Installing and building backend"
Invoke-Native -FilePath $script:NpmBin -Arguments @("ci") -WorkingDirectory $ServerDir
Invoke-Native -FilePath $script:NpxBin -Arguments @("prisma", "generate") -WorkingDirectory $ServerDir
Invoke-Native -FilePath $script:NpmBin -Arguments @("run", "build") -WorkingDirectory $ServerDir

Write-DeployLog "Installing and building frontend"
Invoke-Native -FilePath $script:NpmBin -Arguments @("ci") -WorkingDirectory $WebDir
Invoke-Native -FilePath $script:NpmBin -Arguments @("run", "build") -WorkingDirectory $WebDir

Write-DeployLog "Restarting services with pm2"
Ensure-Pm2Process -Name $ServerProcessName -WorkingDirectory $ServerDir
Ensure-Pm2Process -Name $WebProcessName -WorkingDirectory $WebDir

try {
  Invoke-Native -FilePath $script:Pm2Bin -Arguments @("save")
} catch {
  Write-DeployLog "pm2 save failed and was ignored: $($_.Exception.Message)"
}

Wait-ForHttp -Url $ServerHealthcheckUrl -Label "backend"
Wait-ForHttp -Url $WebHealthcheckUrl -Label "frontend"

Write-DeployLog "Deployment completed successfully"
