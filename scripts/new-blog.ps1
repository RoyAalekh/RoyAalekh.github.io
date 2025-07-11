#!/usr/bin/env pwsh
param(
    [Parameter(Mandatory=$true)]
    [string]$Title,
    
    [Parameter(Mandatory=$false)]
    [string]$Author = "Aalekh Roy",
    
    [Parameter(Mandatory=$false)]
    [string]$Excerpt = "",
    
    [Parameter(Mandatory=$false)]
    [string[]]$Tags = @(),
    
    [Parameter(Mandatory=$false)]
    [string[]]$Categories = @("data-science"),
    
    [Parameter(Mandatory=$false)]
    [switch]$Draft = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Typst = $false
)

# Get current date
$CurrentDate = Get-Date -Format "yyyy-MM-dd"
$FormattedDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"

# Create filename-safe slug
$Slug = $Title.ToLower() -replace '[^a-z0-9\s-]', '' -replace '\s+', '-' -replace '-+', '-'
$Filename = "$CurrentDate-$Slug"

# Determine file extension and directory
if ($Typst) {
    $FileExtension = "typ"
    $Directory = "_typst"
    $FilePath = "$Directory/$Filename.$FileExtension"
} else {
    $FileExtension = "md"
    if ($Draft) {
        $Directory = "_drafts"
        $FilePath = "$Directory/$Slug.$FileExtension"
    } else {
        $Directory = "_posts"
        $FilePath = "$Directory/$Filename.$FileExtension"
    }
}

# Create directory if it doesn't exist
if (!(Test-Path $Directory)) {
    New-Item -ItemType Directory -Path $Directory -Force
}

# Check if file already exists
if (Test-Path $FilePath) {
    Write-Error "File already exists: $FilePath"
    exit 1
}

# Create content based on format
if ($Typst) {
    # Create Typst blog post
    $TagsString = if ($Tags.Count -gt 0) { "(" + ($Tags | ForEach-Object { "`"$_`"" }) -join ", " + ")" } else { "()" }
    $CategoriesString = if ($Categories.Count -gt 0) { "(" + ($Categories | ForEach-Object { "`"$_`"" }) -join ", " + ")" } else { "()" }
    
    $Content = @"
#import "../blog-template.typ": blog-post

#show: blog-post.with(
  title: "$Title",
  author: "$Author",
  date: datetime.today(),
  excerpt: "$Excerpt",
  tags: $TagsString,
  draft: $($Draft.ToString().ToLower()),
)

= Introduction

Write your blog post content here using Typst syntax.

== Subsection

You can use:
- Math: $ integral_0^infinity e^(-x^2) d x = sqrt(pi)/2 $
- Code blocks
- Tables
- Figures
- And more!

```python
def hello_world():
    print("Hello from Typst!")
```

== Conclusion

Your conclusions here.
"@
    
} else {
    # Create Markdown blog post
    $TagsYaml = if ($Tags.Count -gt 0) { "[" + ($Tags | ForEach-Object { "`"$_`"" }) -join ", " + "]" } else { "[]" }
    $CategoriesYaml = if ($Categories.Count -gt 0) { "[" + ($Categories | ForEach-Object { "`"$_`"" }) -join ", " + "]" } else { "[]" }
    
    $Content = @"
---
layout: post
title: "$Title"
author: "$Author"
date: $FormattedDate
excerpt: "$Excerpt"
tags: $TagsYaml
categories: $CategoriesYaml
$(if ($Draft) { "draft: true" })
---

## Introduction

Write your blog post content here using Markdown syntax.

### Subsection

You can use:
- Math: $$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$
- Code blocks
- Tables
- Images
- And more!

```python
def hello_world():
    print("Hello from Markdown!")
```

### Conclusion

Your conclusions here.
"@
}

# Write the file
$Content | Out-File -FilePath $FilePath -Encoding UTF8

Write-Host "✅ Created new blog post: $FilePath" -ForegroundColor Green
Write-Host "📝 Title: $Title" -ForegroundColor Cyan
Write-Host "📅 Date: $CurrentDate" -ForegroundColor Cyan
Write-Host "🏷️  Tags: $($Tags -join ', ')" -ForegroundColor Cyan
Write-Host "📁 Categories: $($Categories -join ', ')" -ForegroundColor Cyan

if ($Typst) {
    Write-Host "🎨 Format: Typst" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Edit the Typst file: $FilePath" -ForegroundColor White
    Write-Host "2. Run: .\scripts\build-typst.ps1 -File $FilePath" -ForegroundColor White
    Write-Host "3. Review the generated markdown and PDF" -ForegroundColor White
    Write-Host "4. Commit and push your changes" -ForegroundColor White
} else {
    Write-Host "📝 Format: Markdown" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Edit the markdown file: $FilePath" -ForegroundColor White
    Write-Host "2. Preview locally: bundle exec jekyll serve" -ForegroundColor White
    Write-Host "3. Commit and push your changes" -ForegroundColor White
}
