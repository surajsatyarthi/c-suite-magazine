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
      // Homepage Spotlight (formerly CXO Features)
      S.listItem()
        .id('homepage-spotlight')
        .title('Homepage Spotlight')
        .child(
          S.documentList()
            .title('Homepage Spotlight')
            .filter('_type == "post" && _id in coalesce(*[_type == "spotlightConfig"] | order(_updatedAt desc)[0].items[]._ref, [])')
            .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
            .child((documentId) =>
              S.document().documentId(documentId).schemaType('post')
            )
        ),

      // Articles (not spotlighted)
      S.listItem()
        .id('normal-articles')
        .title('All Articles (not spotlighted)')
        .child(
          S.documentList()
            .title('All Articles (not spotlighted)')
            .filter('_type == "post" && !(_id in coalesce(*[_type == "spotlightConfig"] | order(_updatedAt desc)[0].items[]._ref, []))')
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
      S.documentTypeListItem('post').title('Posts'),
      S.documentTypeListItem('category').title('Categories'),
      S.documentTypeListItem('writer').title('Writers'),
      S.listItem()
        .id('spotlight-config-singleton')
        .title('Spotlight Config')
        .child(
          S.document()
            .schemaType('spotlightConfig')
            .documentId('spotlightConfig')
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['post', 'category', 'writer', 'spotlightConfig', 'csa'].includes(item.getId()!),
      ),
    ])
