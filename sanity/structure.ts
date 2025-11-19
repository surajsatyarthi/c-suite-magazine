import type {StructureResolver} from 'sanity/structure'

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
      // CXO Features (Homepage Spotlight)
      S.listItem()
        .id('cxo-features')
        .title('CXO Features')
        .child(
          S.documentList()
            .title('CXO Features')
            .filter('_type == "post" && _id in coalesce(*[_type == "spotlightConfig"] | order(_updatedAt desc)[0].items[]._ref, [])')
            .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
        ),
      // CXO Interviews (not featured)
      S.listItem()
        .id('cxo-interviews')
        .title('CXO Interviews (not featured)')
        .child(
          S.documentList()
            .title('CXO Interviews (not featured)')
            .filter('_type == "post" && "cxo-interview" in categories[]->slug.current && !(_id in coalesce(*[_type == "spotlightConfig"] | order(_updatedAt desc)[0].items[]._ref, []))')
            .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
        ),
      // Normal Articles (everything not spotlighted)
      S.listItem()
        .id('normal-articles')
        .title('Normal Articles')
        .child(
          S.documentList()
            .title('Normal Articles')
            .filter('_type == "post" && !(_id in coalesce(*[_type == "spotlightConfig"] | order(_updatedAt desc)[0].items[]._ref, []))')
            .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
        ),
      S.listItem()
        .title('Featured Articles')
        .child(
          S.documentList()
            .title('Featured Articles')
            .filter('_type == "post" && isFeatured == true')
            .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
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
        (item) => item.getId() && !['post', 'category', 'writer', 'spotlightConfig'].includes(item.getId()!),
      ),
    ])
