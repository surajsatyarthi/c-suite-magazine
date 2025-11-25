import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {csaType} from './csaType'
import {writerType} from './writerType'
import {adType} from './adType'
import {spotlightConfigType} from './spotlightConfigType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blockContentType, categoryType, postType, csaType, writerType, adType, spotlightConfigType],
}
