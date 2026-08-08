import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'heading', type: 'text', required: true, localized: true },
    { name: 'subheading', type: 'textarea', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'ctaLabel', type: 'text', localized: true, admin: { width: '50%' } },
        { name: 'ctaHref', type: 'text', admin: { width: '50%' } },
      ],
    },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'Text', plural: 'Text blocks' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'content', type: 'richText', localized: true },
  ],
}

export const ImageTextBlock: Block = {
  slug: 'imageText',
  labels: { singular: 'Image + text', plural: 'Image + text blocks' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'content', type: 'richText', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'end',
      options: [
        { label: 'Leading side', value: 'start' },
        { label: 'Trailing side', value: 'end' },
      ],
    },
  ],
}

export const TourGridBlock: Block = {
  slug: 'tourGrid',
  labels: { singular: 'Tour grid', plural: 'Tour grids' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'intro', type: 'textarea', localized: true },
    {
      name: 'tours',
      type: 'relationship',
      relationTo: 'tours',
      hasMany: true,
      admin: { description: 'Leave empty to show the most recently published tours.' },
    },
    { name: 'limit', type: 'number', defaultValue: 3 },
  ],
}

export const HeritageGridBlock: Block = {
  slug: 'heritageGrid',
  labels: { singular: 'Heritage site grid', plural: 'Heritage site grids' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'intro', type: 'textarea', localized: true },
    { name: 'sites', type: 'relationship', relationTo: 'heritage-sites', hasMany: true },
    { name: 'limit', type: 'number', defaultValue: 6 },
  ],
}

export const DestinationGridBlock: Block = {
  slug: 'destinationGrid',
  labels: { singular: 'Destination grid', plural: 'Destination grids' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'intro', type: 'textarea', localized: true },
    { name: 'destinations', type: 'relationship', relationTo: 'destinations', hasMany: true },
    { name: 'limit', type: 'number', defaultValue: 6 },
  ],
}

export const FaqBlock: Block = {
  slug: 'faqAccordion',
  labels: { singular: 'FAQ section', plural: 'FAQ sections' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'scope',
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Booking', value: 'booking' },
      ],
    },
  ],
}

export const CtaBlock: Block = {
  slug: 'ctaBanner',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  fields: [
    { name: 'heading', type: 'text', required: true, localized: true },
    { name: 'body', type: 'textarea', localized: true },
    { name: 'showInquiryButton', type: 'checkbox', defaultValue: true },
    { name: 'showWhatsAppButton', type: 'checkbox', defaultValue: true },
  ],
}

export const InquiryFormBlock: Block = {
  slug: 'inquiryForm',
  labels: { singular: 'Inquiry form', plural: 'Inquiry forms' },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'intro', type: 'textarea', localized: true },
  ],
}

export const layoutBlocks = [
  HeroBlock,
  RichTextBlock,
  ImageTextBlock,
  TourGridBlock,
  HeritageGridBlock,
  DestinationGridBlock,
  FaqBlock,
  CtaBlock,
  InquiryFormBlock,
]
