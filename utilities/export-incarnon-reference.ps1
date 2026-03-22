$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "Docs/reference/wiki/systems/incarnon"
$rawDir = Join-Path $outDir "raw"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
New-Item -ItemType Directory -Force -Path $rawDir | Out-Null

$pages = @(
  @{ Group = "Zariman"; Title = "Felarx" }
  @{ Group = "Zariman"; Title = "Innodem" }
  @{ Group = "Zariman"; Title = "Laetum" }
  @{ Group = "Zariman"; Title = "Phenmor" }
  @{ Group = "Zariman"; Title = "Praedos" }
  @{ Group = "Sanctum Anatomica"; Title = "Onos" }
  @{ Group = "Sanctum Anatomica"; Title = "Ruvox" }
  @{ Group = "Isleweaver"; Title = "Thalys" }
  @{ Group = "Incarnon Genesis Primary"; Title = "Boar Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Primary"; Title = "Boltor Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Primary"; Title = "Braton Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Primary"; Title = "Burston Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Primary"; Title = "Dera Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Primary"; Title = "Dread Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Primary"; Title = "Gorgon Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Primary"; Title = "Latron Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Primary"; Title = "Miter Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Primary"; Title = "Paris Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Primary"; Title = "Soma Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Primary"; Title = "Strun Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Primary"; Title = "Sybaris Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Primary"; Title = "Torid Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Secondary"; Title = "Angstrum Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Secondary"; Title = "Atomos Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Secondary"; Title = "Bronco Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Secondary"; Title = "Cestra Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Secondary"; Title = "Despair Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Secondary"; Title = "Dual Toxocyst Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Secondary"; Title = "Furis Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Secondary"; Title = "Gammacor Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Secondary"; Title = "Kunai Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Secondary"; Title = "Lato Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Secondary"; Title = "Lex Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Secondary"; Title = "Sicarus Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Secondary"; Title = "Vasto Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Secondary"; Title = "Zylok Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Melee"; Title = "Ack & Brunt Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Melee"; Title = "Anku Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Melee"; Title = "Bo Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Melee"; Title = "Ceramic Dagger Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Melee"; Title = "Dual Ichor Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Melee"; Title = "Furax Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Melee"; Title = "Hate Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Melee"; Title = "Magistar Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Melee"; Title = "Nami Solo Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Melee"; Title = "Okina Incarnon Genesis" }
  @{ Group = "Incarnon Genesis Melee"; Title = "Skana Incarnon Genesis" }
)

function Get-Slug([string]$title) {
  $slug = $title.ToLowerInvariant()
  $slug = $slug -replace "&", "and"
  $slug = $slug -replace "[^a-z0-9]+", "-"
  $slug = $slug.Trim("-")
  return $slug
}

function Get-PageUrl([string]$title) {
  $wikiTitle = $title.Replace(" ", "_")
  return "https://wiki.warframe.com/w/$wikiTitle"
}

function Get-EditUrl([string]$title) {
  $wikiTitle = $title.Replace(" ", "_")
  return "https://wiki.warframe.com/w/$($wikiTitle)?action=edit"
}

function Extract-WikitextFromEditHtml([string]$html) {
  $match = [regex]::Match(
    $html,
    '<textarea[^>]*id="wpTextbox1"[^>]*>(.*?)</textarea>',
    [System.Text.RegularExpressions.RegexOptions]::Singleline
  )

  if (-not $match.Success) {
    throw "Could not locate wpTextbox1 in edit HTML"
  }

  $decoded = [System.Net.WebUtility]::HtmlDecode($match.Groups[1].Value)
  return $decoded.Trim()
}

function Clean-Intro([string]$raw) {
  $firstHeadingIndex = $raw.IndexOf("==")
  if ($firstHeadingIndex -lt 0) {
    $intro = $raw
  } else {
    $intro = $raw.Substring(0, $firstHeadingIndex)
  }

  $lines = $intro -split "`n"
  $keep = New-Object System.Collections.Generic.List[string]

  foreach ($line in $lines) {
    $trimmed = $line.Trim()
    if ([string]::IsNullOrWhiteSpace($trimmed)) { continue }
    if ($trimmed.StartsWith("{{")) { continue }
    if ($trimmed.StartsWith("|")) { continue }
    if ($trimmed.StartsWith("}}")) { continue }
    $keep.Add($trimmed)
  }

  return ($keep -join "`n")
}

function Get-Headings([string]$raw) {
  $lines = $raw -split "`n"
  $headings = New-Object System.Collections.Generic.List[string]
  foreach ($line in $lines) {
    if ($line -match '^(=+)\s*(.*?)\s*\1\s*$') {
      $headings.Add($matches[2].Trim())
    }
  }
  return $headings
}

function Get-Sections([string]$raw) {
  $lines = $raw -split "`n"
  $sections = @{}
  $current = "__intro__"
  $buffer = New-Object System.Collections.Generic.List[string]

  foreach ($line in $lines) {
    if ($line -match '^(=+)\s*(.*?)\s*\1\s*$') {
      if (-not $sections.ContainsKey($current)) {
        $sections[$current] = ($buffer -join "`n").Trim()
      }
      $current = $matches[2].Trim()
      $buffer = New-Object System.Collections.Generic.List[string]
      continue
    }
    $buffer.Add($line)
  }

  if (-not $sections.ContainsKey($current)) {
    $sections[$current] = ($buffer -join "`n").Trim()
  }

  return $sections
}

function Get-RelevantSectionNames([System.Collections.Generic.List[string]]$headings) {
  $wanted = @(
    "Incarnon",
    "Incarnon Form",
    "Incarnon Genesis",
    "Overview",
    "Mechanics",
    "Evolutions",
    "Challenges",
    "Challenge",
    "Known Bugs",
    "Notes"
  )

  $result = New-Object System.Collections.Generic.List[string]
  foreach ($wantedName in $wanted) {
    foreach ($heading in $headings) {
      if ($heading -eq $wantedName -and -not $result.Contains($heading)) {
        $result.Add($heading)
      }
    }
  }
  return $result
}

$today = Get-Date -Format "yyyy-MM-dd"
$inventory = New-Object System.Collections.Generic.List[string]

foreach ($page in $pages) {
  $title = $page.Title
  $group = $page.Group
  $slug = Get-Slug $title
  $pageUrl = Get-PageUrl $title
  $editUrl = Get-EditUrl $title

  Write-Host "Fetching $title"
  $editHtml = (curl.exe -s -L --compressed $editUrl) -join "`n"
  if ([string]::IsNullOrWhiteSpace($editHtml)) {
    throw "Failed to download edit page for $title"
  }
  $raw = Extract-WikitextFromEditHtml $editHtml
  if ([string]::IsNullOrWhiteSpace($raw)) {
    throw "Failed to download raw page for $title"
  }
  if ($raw -match '<!DOCTYPE html>|<html|<head>|<body') {
    throw "Expected wikitext but received HTML for $title from $editUrl"
  }

  $rawPath = Join-Path $rawDir "$slug.wikitext"
  Set-Content -Path $rawPath -Value $raw -Encoding UTF8

  $headings = Get-Headings $raw
  $sections = Get-Sections $raw
  $relevantSections = Get-RelevantSectionNames $headings
  $intro = Clean-Intro $raw

  $md = New-Object System.Collections.Generic.List[string]
  $md.Add("# $title")
  $md.Add("")
  $md.Add("> Estado: activo")
  $md.Add("> Rol: captura semantica minima de pagina wiki para referencia de Incarnon")
  $md.Add("> Fuente de verdad de: ubicacion de la pagina, headings detectados y bloques raw relevantes")
  $md.Add("> No usar para: schema final del engine o calculo ya validado")
  $md.Add("> Ultima actualizacion: $today")
  $md.Add("")
  $md.Add("## Fuente")
  $md.Add("")
  $md.Add("- Grupo: ``$group``")
  $md.Add("- Pagina wiki: ``$title``")
  $md.Add("- URL pagina: ``$pageUrl``")
  $md.Add("- URL de extraccion: ``$editUrl``")
  $md.Add("- Metodo: ``textarea#wpTextbox1`` extraido desde ``action=edit``")
  $md.Add("- Archivo raw: ``raw/$slug.wikitext``")
  $md.Add("")

  if (-not [string]::IsNullOrWhiteSpace($intro)) {
    $md.Add("## Resumen bruto")
    $md.Add("")
    $md.Add('```text')
    $md.Add($intro)
    $md.Add('```')
    $md.Add("")
  }

  $md.Add("## Headings detectados")
  $md.Add("")
  if ($headings.Count -eq 0) {
    $md.Add("- ninguno")
  } else {
    foreach ($heading in $headings) {
      $md.Add("- ``$heading``")
    }
  }
  $md.Add("")

  $md.Add("## Bloques relevantes")
  $md.Add("")
  if ($relevantSections.Count -eq 0) {
    $md.Add("No se detectaron headings prioritarios. Revisar el raw completo si esta pagina")
    $md.Add("termina usando otra estructura.")
    $md.Add("")
  } else {
    foreach ($sectionName in $relevantSections) {
      $content = $sections[$sectionName]
      if ([string]::IsNullOrWhiteSpace($content)) { continue }
      $md.Add("### $sectionName")
      $md.Add("")
      $md.Add('```wiki')
      $md.Add($content)
      $md.Add('```')
      $md.Add("")
    }
  }

  $mdPath = Join-Path $outDir "$slug.md"
  Set-Content -Path $mdPath -Value ($md -join "`n") -Encoding UTF8

  $inventory.Add("| ``$title`` | ``$group`` | [raw/$slug.wikitext](./raw/$slug.wikitext) | [$slug.md](./$slug.md) |")
}

$inventoryPath = Join-Path $outDir "downloaded-pages.md"
$inventoryLines = New-Object System.Collections.Generic.List[string]
$inventoryLines.Add("# Downloaded Incarnon Pages")
$inventoryLines.Add("")
$inventoryLines.Add("> Estado: activo")
$inventoryLines.Add("> Rol: inventariar las paginas de Incarnon descargadas y su documentacion derivada")
$inventoryLines.Add("> Fuente de verdad de: listado actual de raw y md semantico")
$inventoryLines.Add("> Ultima actualizacion: $today")
$inventoryLines.Add("")
$inventoryLines.Add("| Pagina | Grupo | Raw | MD |")
$inventoryLines.Add("|---|---|---|---|")
foreach ($line in $inventory) {
  $inventoryLines.Add($line)
}
Set-Content -Path $inventoryPath -Value ($inventoryLines -join "`n") -Encoding UTF8
