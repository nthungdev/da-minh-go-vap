'use client'

import MarkdownEditor from '@/fields/markdown/MarkdownEditor'
import { useField } from '@payloadcms/ui'
import { CodeFieldClientComponent } from 'payload'
import React, { useCallback } from 'react'

export const MarkdownField: CodeFieldClientComponent = (props) => {
  const path = (props?.path || props?.field?.name || '') as string
  const { value, setValue } = useField<string>({ path })

  const onChange = useCallback(
    (value: any) => {
      setValue(value)
    },
    [path]
  )

  return (
    <div className="field-type markdown">
      {true && (
        <MarkdownEditor
          id={`markdown-field-${path.replace(/W/g, '-')}`}
          value={value || ''}
          setValue={onChange}
        />
      )}
    </div>
  )
}
