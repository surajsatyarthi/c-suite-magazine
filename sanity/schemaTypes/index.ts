import { type SchemaTypeDefinition } from 'sanity'


import { blockContentType } from './blockContentType'
import { categoryType } from './categoryType'
import { csaType } from './csaType'
import { postType } from './postType'
import { spotlightConfigType } from './spotlightConfigType'
import { videoType } from './videoType'
import { writerType } from './writerType'
import { carouselType } from './carouselType'
import { ctaType } from './ctaType'
import { executiveInFocusType } from './executiveInFocusType'
import { executiveInFocusConfigType } from './executiveInFocusConfigType'
import { partnerQuotesType } from './partnerQuotesType'

import { advertisementType } from './advertisementType'

import { industryJuggernautConfigType } from './industryJuggernautConfigType'
import { systemLogType } from './systemLogType'

import { siteSettingsType } from "./siteSettingsType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blockContentType, categoryType, postType, csaType, writerType, advertisementType, spotlightConfigType, videoType, carouselType, ctaType, executiveInFocusType, executiveInFocusConfigType, industryJuggernautConfigType, partnerQuotesType, systemLogType, siteSettingsType],
}
