'use client'

import { FieldLabel } from '@payloadcms/ui'
import { CodeFieldLabelClientComponent } from 'payload'
import React from 'react'

const MarkdownFieldLabel: CodeFieldLabelClientComponent = (props) => {
  return <FieldLabel label={props?.label} path={props?.path} />
}

export default MarkdownFieldLabel