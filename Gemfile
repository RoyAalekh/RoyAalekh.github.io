source "https://rubygems.org"

gem "jekyll", "~> 4.3.0"
gem "jekyll-theme-minimal", "~> 0.2.0"
gem "faraday-retry", "~> 2.0" # For retry middleware
gem "bigdecimal" # To silence warnings
gem "webrick", "~> 1.8" # Required for Jekyll on Ruby 3+
platforms :mingw, :x64_mingw, :mswin do
  gem "wdm", ">= 0.1.0" # Recommended for Windows (file watcher)
end

# Performance optimization gems
gem "jekyll-sass-converter", "~> 2.2"
gem "kramdown-parser-gfm"
