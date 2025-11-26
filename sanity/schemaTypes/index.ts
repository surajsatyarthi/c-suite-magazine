import { type SchemaTypeDefinition } from 'sanity'

import { adType } from './adType'
import { blockContentType } from './blockContentType'
import { categoryType } from './categoryType'
import { csaType } from './csaType'
import { postType } from './postType'
import { spotlightConfigType } from './spotlightConfigType'
import { videoType } from './videoType'
import { writerType } from './writerType'
import { carouselType } from './carouselType'
import { ctaType } from './ctaType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blockContentType, categoryType, postType, csaType, writerType, adType, spotlightConfigType, videoType, carouselType, ctaType],
}
