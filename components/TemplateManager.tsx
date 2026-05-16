'use client'

import { useState, useEffect } from 'react'
import { Palette, Type, FileText, Copy, Trash2, Check, Loader2, Plus } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string | null
  language: string
  currency: string
  currencySymbol: string
  isDefault: boolean
  isPremium: boolean
  primaryColor: string
  secondaryColor: string
  accentColor: string
  labels: any
  showLogo: boolean
  showPaymentInfo: boolean
  showNotes: boolean
  showTerms: boolean
}

interface TemplateManagerProps {
  onSelectTemplate?: (template: Template) => void
  selectedId?: string | null
}

export function TemplateManager({ onSelectTemplate, selectedId }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'browse' | 'edit'>('browse')
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data.templates)
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const duplicateTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/templates/${id}/duplicate`, { method: 'POST' })
      if (res.ok) {
        fetchTemplates()
      }
    } catch (err) {
      alert('Failed to duplicate template')
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTemplates(templates.filter(t => t.id !== id))
      }
    } catch (err) {
      alert('Failed to delete template')
    }
  }

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      en: 'English',
      nl: 'Nederlands',
      de: 'Deutsch',
      fr: 'Français',
      es: 'Español',
    }
    return labels[lang] || lang
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-indigo-600" size={24} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="text-indigo-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Invoice Templates</h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'browse'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Browse Templates
        </button>
      </div>

      {/* Template Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-[32px]">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-500">Default templates will be loaded on first use</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => onSelectTemplate?.(template)}
              className={`group cursor-pointer rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${
                selectedId === template.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-100 bg-white hover:border-indigo-200'
              }`}
            >
              {/* Color Preview */}
              <div className="flex gap-1 mb-4">
                <div 
                  className="h-8 w-8 rounded-lg" 
                  style={{ backgroundColor: template.primaryColor }}
                />
                <div 
                  className="h-8 w-8 rounded-lg" 
                  style={{ backgroundColor: template.secondaryColor }}
                />
                <div 
                  className="h-8 w-8 rounded-lg" 
                  style={{ backgroundColor: template.accentColor }}
                />
              </div>

              {/* Name & Badge */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-gray-900">{template.name}</h3>
                {template.isDefault && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                    Default
                  </span>
                )}
                {template.isPremium && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                    Premium
                  </span>
                )}
              </div>

              {/* Description */}
              {template.description && (
                <p className="text-sm text-gray-500 mb-3">{template.description}</p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Type size={12} />
                  {getLanguageLabel(template.language)}
                </span>
                <span>
                  {template.currencySymbol} {template.currency}
                </span>
              </div>

              {/* Actions */}
              {!template.isDefault && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      duplicateTemplate(template.id)
                    }}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600"
                  >
                    <Copy size={14} />
                    Duplicate
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteTemplate(template.id)
                    }}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}

              {/* Selected Indicator */}
              {selectedId === template.id && (
                <div className="absolute top-2 right-2">
                  <Check className="text-indigo-600" size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}