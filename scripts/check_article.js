export const query = `*[_type == "post" && slug.current == "angelina-usanova"]{title, excerpt, mainImage, "writer": writer->name}`
