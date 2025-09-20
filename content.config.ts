export default defineContentConfig({
  // Configure content collections - simplified for now
  markdown: {
    anchorLinks: false, // Disable anchor links for security
    mdc: true
  },
  highlight: {
    theme: 'github-light'
  }
})
