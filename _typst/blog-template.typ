#import "@preview/hydra:0.5.1": hydra
#import "@preview/codly:1.0.0": *

// Blog post template
#let blog-post(
  title: "",
  author: "Aalekh Roy",
  date: datetime.today(),
  excerpt: "",
  tags: (),
  draft: false,
  body
) = {
  // Set document metadata
  set document(title: title, author: author, date: date)
  
  // Page setup
  set page(
    paper: "a4",
    margin: (left: 1.5in, right: 1.5in, top: 1.5in, bottom: 1.5in),
    numbering: "1",
    header: locate(loc => {
      if counter(page).at(loc).first() > 1 {
        align(center, text(size: 10pt, fill: gray)[#title])
      }
    }),
    footer: locate(loc => {
      align(center, text(size: 10pt, fill: gray)[
        #counter(page).display("1 / 1", both: true)
      ])
    })
  )
  
  // Typography
  set text(font: "Linux Libertine", size: 11pt)
  set par(justify: true, leading: 0.65em)
  
  // Headings
  set heading(numbering: "1.1")
  show heading: it => {
    set text(font: "Linux Biolinum")
    if it.level == 1 {
      pagebreak(weak: true)
      v(2em)
      text(size: 18pt, weight: "bold")[#it.body]
      v(1em)
    } else if it.level == 2 {
      v(1.5em)
      text(size: 14pt, weight: "bold")[#it.body]
      v(0.5em)
    } else {
      v(1em)
      text(size: 12pt, weight: "bold")[#it.body]
      v(0.5em)
    }
  }
  
  // Code blocks
  show: codly-init.with()
  codly(
    languages: (
      python: (name: "Python", color: rgb("#3572A5")),
      r: (name: "R", color: rgb("#198CE7")),
      julia: (name: "Julia", color: rgb("#9558B2")),
      bash: (name: "Bash", color: rgb("#89E051")),
      sql: (name: "SQL", color: rgb("#E38C00")),
    )
  )
  
  // Math
  set math.equation(numbering: "(1)")
  
  // Links
  show link: it => {
    text(fill: blue, it)
  }
  
  // Title page
  v(2em)
  align(center)[
    #text(size: 24pt, weight: "bold")[#title]
    #v(1em)
    #text(size: 14pt, style: "italic")[#author]
    #v(0.5em)
    #text(size: 12pt, fill: gray)[#date.display("[month repr:long] [day], [year]")]
    #if tags.len() > 0 {
      v(0.5em)
      text(size: 10pt, fill: gray)[Tags: #tags.join(", ")]
    }
  ]
  
  v(2em)
  
  // Excerpt
  if excerpt != "" {
    rect(
      width: 100%,
      inset: 1em,
      stroke: 0.5pt + gray,
      fill: gray.lighten(95%),
      [
        *Abstract:* #excerpt
      ]
    )
    v(1em)
  }
  
  // Content
  body
}

// Export as markdown compatible
#let export-markdown(
  title: "",
  author: "Aalekh Roy", 
  date: datetime.today(),
  excerpt: "",
  tags: (),
  draft: false,
  categories: (),
  body
) = {
  // YAML frontmatter
  let frontmatter = "---\n"
  frontmatter += "layout: post\n"
  frontmatter += "title: \"" + title + "\"\n"
  frontmatter += "author: \"" + author + "\"\n"
  frontmatter += "date: " + date.display("[year]-[month repr:numerical padding:zero]-[day padding:zero]") + "\n"
  if excerpt != "" {
    frontmatter += "excerpt: \"" + excerpt + "\"\n"
  }
  if tags.len() > 0 {
    frontmatter += "tags: [" + tags.map(tag => "\"" + tag + "\"").join(", ") + "]\n"
  }
  if categories.len() > 0 {
    frontmatter += "categories: [" + categories.map(cat => "\"" + cat + "\"").join(", ") + "]\n"
  }
  if draft {
    frontmatter += "draft: true\n"
  }
  frontmatter += "---\n\n"
  
  // Return the frontmatter (body will be converted separately)
  frontmatter
}
