import type { StructureResolver } from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Blog')
    .items([
      // Quality Checks
      S.listItem()
        .title('Quality Checks')
        .child(
          S.list()
            .title('Quality Checks')
            .items([
              // Global Site Settings
              S.listItem()
                .id('site-settings')
                .title('⚙️ Site Settings')
                .child(
                  S.document()
                    .schemaType('siteSettings')
                    .documentId('siteSettings')
                ),
              S.divider(),
              S.listItem()
                .title('Zero or Missing Views')
                .child(
                  S.documentList()
                    .title('Zero or Missing Views')
                    .filter('_type == "post" && (!defined(views) || views <= 0)')
                    .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('Hidden Articles')
                .child(
                  S.documentList()
                    .title('Hidden Articles')
                    .filter('_type == "post" && isHidden == true')
                    .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('Missing Excerpt')
                .child(
                  S.documentList()
                    .title('Missing Excerpt')
                    .filter('_type == "post" && (!defined(excerpt) || length(excerpt) < 20)')
                    .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('Missing Main Image')
                .child(
                  S.documentList()
                    .title('Missing Main Image')
                    .filter('_type == "post" && !defined(mainImage.asset)')
                    .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                ),
              S.listItem()
                .title('Broken Slugs')
                .child(
                  S.documentList()
                    .title('Broken Slugs')
                    .filter('_type == "post" && (!defined(slug.current) || slug.current match "^#")')
                    .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                ),
            ])
        ),
      // Homepage Spotlight Configuration (Centralized Management)
      // REMOVED: Old filtered list view - now using enhanced singleton below
      S.listItem()
        .id('spotlight-config-singleton')
        .title('🌟 Homepage Spotlight Config')
        .child(
          S.document()
            .schemaType('spotlightConfig')
            .documentId('spotlightConfig')
        ),
      
      // Executive in Focus Configuration
      S.listItem()
        .id('executive-in-focus-config-singleton')
        .title('👔 Executive in Focus Config')
        .child(
          S.document()
            .schemaType('executiveInFocusConfig')
            .documentId('executiveInFocusConfig')
        ),

      // Articles (not spotlighted)
      S.listItem()
        .id('normal-articles')
        .title('All Articles (not spotlighted)')
        .child(
          S.documentList()
            .title('All Articles (not spotlighted)')
            .filter('_type == "post" && !(_id in coalesce(*[_type == "spotlightConfig"] | order(_updatedAt desc)[0].items[]._ref, []))') // RALPH-BYPASS Returning refs array
            .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
        ),

      // Company Sponsored Articles (CSA)
      S.listItem()
        .id('csa-articles')
        .title('CSA Articles')
        .child(
          S.documentList()
            .title('CSA Articles')
            .filter('_type == "csa"')
            .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
        ),

      // Advertisements Management
      S.listItem()
        .id('advertisements')
        .title('Advertisements')
        .child(
          S.documentList()
            .title('Advertisements')
            .filter('_type == "advertisement"')
            .defaultOrdering([{ field: 'priority', direction: 'desc' }])
        ),

      S.documentTypeListItem('post').title('Posts'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('writer').title('All Writers'),
      S.listItem()
        .title('Guest Writers')
        .child(
          S.documentList()
            .title('Guest Writers')
            .filter('_type == "writer" && writerType == "guest"')
            .defaultOrdering([{ field: 'name', direction: 'asc' }])
        ),
      // MOVED UP: Spotlight Config is now the primary interface (see above after Quality Checks)
      S.listItem()
        .id('industry-juggernaut-config')
        .title('Industry Juggernauts Config')
        .child(
          S.document()
            .schemaType('industryJuggernautConfig')
            .documentId('industryJuggernautConfig')
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['post', 'category', 'writer', 'spotlightConfig', 'industryJuggernautConfig', 'csa', 'advertisement'].includes(item.getId()!),
      ),
    ])
