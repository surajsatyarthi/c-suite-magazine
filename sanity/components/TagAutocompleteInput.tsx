import React, {useCallback, useMemo} from 'react'
import {Stack, Text, Autocomplete} from '@sanity/ui'
import {set, unset, useClient} from 'sanity'
import {GET_POPULAR_TAGS, processPopularTags} from '../lib/tagQueries'

/**
 * Custom Tag Autocomplete Component
 * Guides writers to reuse existing high-quality tags
 */
export function TagAutocompleteInput(props: any) {
  const {value, onChange, elementProps} = props
  const client = useClient({apiVersion: '2025-10-28'})
  
  const [popularTags, setPopularTags] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)

  // Fetch popular tags on mount
  React.useEffect(() => {
    client.fetch(GET_POPULAR_TAGS).then(posts => {
      const processed = processPopularTags(posts)
      setPopularTags(processed)
      setLoading(false)
    }).catch(err => {
      console.error('Failed to fetch popular tags:', err)
      setLoading(false)
    })
  }, [client])

  // Map to Sanity UI Autocomplete format
  const items = useMemo(() => {
    return popularTags.map(tag => ({
      value: tag,
      payload: tag
    }))
  }, [popularTags])

  const handleChange = useCallback(
    (nextValue: string) => {
      onChange(nextValue ? set(nextValue) : unset())
    },
    [onChange]
  )

  return (
    <Stack space={3}>
      <Autocomplete
        {...elementProps}
        id="tag-autocomplete"
        fontSize={[2, 2, 3]}
        padding={[3, 3, 4]}
        placeholder="Type to search existing tags..."
        options={items}
        onSelect={handleChange}
        onChange={handleChange}
        value={value}
        loading={loading}
      />
      {popularTags.length === 0 && !loading && (
        <Text size={1} muted>
          No existing tags found. Creating a new tag.
        </Text>
      )}
    </Stack>
  )
}
