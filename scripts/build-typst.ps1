#!/usr/bin/env pwsh
param(
    [Parameter(Mandatory=$false)]
    [string]$File = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$All = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Watch = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipMarkdown = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipPDF = $false
)

# Check if Typst is installed
if (!(Get-Command "typst" -ErrorAction SilentlyContinue)) {
    Write-Error "Typst is not installed. Please install it from https://typst.app/docs/installation/"
    Write-Host "Windows: winget install --id Typst.Typst" -ForegroundColor Yellow
    exit 1
}

# Check if Pandoc is installed (for markdown conversion)
if (!(Get-Command "pandoc" -ErrorAction SilentlyContinue) -and !$SkipMarkdown) {
    Write-Warning "Pandoc is not installed. Markdown conversion will be skipped."
    Write-Host "Install Pandoc: winget install --id JohnMacFarlane.Pandoc" -ForegroundColor Yellow
    $SkipMarkdown = $true
}

function Build-TypstFile {
    param(
        [string]$FilePath
    )
    
    $BaseName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)
    $Directory = [System.IO.Path]::GetDirectoryName($FilePath)
    $OutputPdf = "$Directory/$BaseName.pdf"
    $OutputMarkdown = "_posts/$BaseName.md"
    
    Write-Host "🔨 Building: $FilePath" -ForegroundColor Cyan
    
    # Generate PDF if not skipped
    if (!$SkipPDF) {
        Write-Host "📄 Generating PDF..." -ForegroundColor Yellow
        $PdfResult = & typst compile $FilePath $OutputPdf 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PDF generated: $OutputPdf" -ForegroundColor Green
        } else {
            Write-Error "❌ PDF generation failed: $PdfResult"
            return $false
        }
    }
    
    # Generate Markdown if not skipped
    if (!$SkipMarkdown -and (Get-Command "pandoc" -ErrorAction SilentlyContinue)) {
        Write-Host "📝 Converting to Markdown..." -ForegroundColor Yellow
        
        # First, convert Typst to intermediate format, then to Markdown
        # Note: This is a simplified conversion - you might need to adjust based on your content
        try {
            # Read the Typst file and extract metadata
            $Content = Get-Content $FilePath -Raw
            
            # Extract metadata from Typst show directive
            $TitleMatch = [regex]::Match($Content, 'title:\s*"([^"]*)"')
            $AuthorMatch = [regex]::Match($Content, 'author:\s*"([^"]*)"')
            $ExcerptMatch = [regex]::Match($Content, 'excerpt:\s*"([^"]*)"')
            $TagsMatch = [regex]::Match($Content, 'tags:\s*\(([^)]*)\)')
            $DraftMatch = [regex]::Match($Content, 'draft:\s*(true|false)')
            
            $Title = if ($TitleMatch.Success) { $TitleMatch.Groups[1].Value } else { $BaseName }
            $Author = if ($AuthorMatch.Success) { $AuthorMatch.Groups[1].Value } else { "Aalekh Roy" }
            $Excerpt = if ($ExcerptMatch.Success) { $ExcerptMatch.Groups[1].Value } else { "" }
            $Draft = if ($DraftMatch.Success) { $DraftMatch.Groups[1].Value -eq "true" } else { $false }
            
            # Parse tags
            $Tags = @()
            if ($TagsMatch.Success) {
                $TagsString = $TagsMatch.Groups[1].Value
                $Tags = $TagsString.Split(',') | ForEach-Object { $_.Trim().Trim('"') } | Where-Object { $_ -ne "" }
            }
            
            # Create YAML frontmatter
            $Frontmatter = @"
---
layout: post
title: "$Title"
author: "$Author"
date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz")
excerpt: "$Excerpt"
tags: [$(($Tags | ForEach-Object { '"' + $_ + '"' }) -join ', ')]
categories: ["data-science"]
$(if ($Draft) { "draft: true" })
---

"@
            
            # For now, create a placeholder markdown file
            # In a full implementation, you'd want to convert the Typst content to Markdown
            $MarkdownContent = @"
$Frontmatter
<!-- This blog post was generated from Typst -->
<!-- Original Typst file: $FilePath -->
<!-- PDF version: $OutputPdf -->

*This post is currently available as a PDF. The full markdown conversion is in progress.*

[📄 View PDF Version]($OutputPdf)

## Content Preview

*Content will be converted from Typst to Markdown automatically.*

<!-- TODO: Implement full Typst to Markdown conversion -->
"@
            
            # Write the markdown file
            $MarkdownContent | Out-File -FilePath $OutputMarkdown -Encoding UTF8
            Write-Host "✅ Markdown generated: $OutputMarkdown" -ForegroundColor Green
            
        } catch {
            Write-Error "❌ Markdown conversion failed: $_"
            return $false
        }
    }
    
    return $true
}

# Main execution
if ($All) {
    # Build all Typst files
    $TypstFiles = Get-ChildItem -Path "_typst" -Filter "*.typ" -Recurse | Where-Object { $_.Name -ne "blog-template.typ" }
    
    if ($TypstFiles.Count -eq 0) {
        Write-Host "📭 No Typst files found to build." -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "🔨 Building $($TypstFiles.Count) Typst files..." -ForegroundColor Cyan
    
    $SuccessCount = 0
    foreach ($TypstFile in $TypstFiles) {
        if (Build-TypstFile -FilePath $TypstFile.FullName) {
            $SuccessCount++
        }
        Write-Host ""
    }
    
    Write-Host "✅ Built $SuccessCount/$($TypstFiles.Count) files successfully." -ForegroundColor Green
    
} elseif ($File -ne "") {
    # Build specific file
    if (!(Test-Path $File)) {
        Write-Error "File not found: $File"
        exit 1
    }
    
    if ($Watch) {
        Write-Host "👀 Watching file for changes: $File" -ForegroundColor Magenta
        Write-Host "Press Ctrl+C to stop watching..." -ForegroundColor Yellow
        
        $LastWriteTime = (Get-Item $File).LastWriteTime
        
        while ($true) {
            Start-Sleep -Seconds 1
            $CurrentWriteTime = (Get-Item $File).LastWriteTime
            
            if ($CurrentWriteTime -ne $LastWriteTime) {
                Write-Host "📝 File changed, rebuilding..." -ForegroundColor Yellow
                Build-TypstFile -FilePath $File
                $LastWriteTime = $CurrentWriteTime
                Write-Host "✅ Rebuild complete. Watching for changes..." -ForegroundColor Green
            }
        }
    } else {
        Build-TypstFile -FilePath $File
    }
    
} else {
    Write-Host "📚 Typst Blog Builder" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\scripts\build-typst.ps1 -File <path>          # Build specific file"
    Write-Host "  .\scripts\build-typst.ps1 -All                 # Build all Typst files"
    Write-Host "  .\scripts\build-typst.ps1 -File <path> -Watch  # Watch file for changes"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -SkipPDF        # Skip PDF generation"
    Write-Host "  -SkipMarkdown   # Skip Markdown conversion"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  .\scripts\build-typst.ps1 -File _typst/2025-01-12-my-post.typ"
    Write-Host "  .\scripts\build-typst.ps1 -All"
    Write-Host "  .\scripts\build-typst.ps1 -File _typst/2025-01-12-my-post.typ -Watch"
}
