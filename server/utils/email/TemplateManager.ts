import fs from 'fs'
import path from 'path'
import Handlebars from 'handlebars'
import type { EmailTemplate } from './types'

export class TemplateManager {
  private templateDir: string
  private templateCache = new Map<string, HandlebarsTemplateDelegate>()
  private metadataCache = new Map<string, EmailTemplate>()

  constructor(templateDir?: string) {
    this.templateDir = templateDir || path.join(process.cwd(), 'server/templates/emails')
  }

  async renderTemplate(templateName: string, data: Record<string, any>): Promise<{ html: string; subject: string }> {
    const template = await this.getCompiledTemplate(templateName)
    const metadata = await this.getTemplateMetadata(templateName)

    const html = template(data)
    const subject = this.renderSubject(metadata.subject, data)

    return { html, subject }
  }

  async getTemplateMetadata(templateName: string): Promise<EmailTemplate> {
    if (this.metadataCache.has(templateName)) {
      return this.metadataCache.get(templateName)!
    }

    const templatePath = path.join(this.templateDir, `${templateName}.html`)
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}`)
    }

    const content = fs.readFileSync(templatePath, 'utf-8')

    // Extract metadata from HTML comments
    const subjectMatch = content.match(/<!--\s*SUBJECT:\s*(.+?)\s*-->/i)
    const variablesMatch = content.match(/<!--\s*VARIABLES:\s*(.+?)\s*-->/i)

    const metadata: EmailTemplate = {
      name: templateName,
      subject: subjectMatch?.[1] || `{{subject}}`,
      htmlContent: content,
      variables: variablesMatch?.[1]?.split(',').map(v => v.trim()) || []
    }

    this.metadataCache.set(templateName, metadata)
    return metadata
  }

  async getAllTemplates(): Promise<EmailTemplate[]> {
    const files = fs.readdirSync(this.templateDir)
    const htmlFiles = files.filter(file => file.endsWith('.html'))

    const templates = await Promise.all(
      htmlFiles.map(file => {
        const templateName = path.basename(file, '.html')
        return this.getTemplateMetadata(templateName)
      })
    )

    return templates
  }

  private async getCompiledTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!
    }

    const templatePath = path.join(this.templateDir, `${templateName}.html`)
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}`)
    }

    const content = fs.readFileSync(templatePath, 'utf-8')
    const template = Handlebars.compile(content)

    this.templateCache.set(templateName, template)
    return template
  }

  private renderSubject(subjectTemplate: string, data: Record<string, any>): string {
    const template = Handlebars.compile(subjectTemplate)
    return template(data)
  }

  // Clear cache when templates change (useful for development)
  clearCache(): void {
    this.templateCache.clear()
    this.metadataCache.clear()
  }

  // Watch for template changes in development
  watchTemplates(callback: (templateName: string) => void): void {
    if (process.env.NODE_ENV === 'development') {
      fs.watch(this.templateDir, (eventType, filename) => {
        if (filename && filename.endsWith('.html')) {
          const templateName = path.basename(filename, '.html')
          this.templateCache.delete(templateName)
          this.metadataCache.delete(templateName)
          callback(templateName)
        }
      })
    }
  }
}