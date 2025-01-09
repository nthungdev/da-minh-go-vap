'use client'

import { FieldLabel } from '@payloadcms/ui'
import { CodeFieldLabelClientComponent } from 'payload'
import React from 'react'

export const MarkdownFieldLabel: CodeFieldLabelClientComponent = (props) => {
  return <FieldLabel label={props?.label} path={props?.path} />
}
