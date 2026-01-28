
import { CogIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "title",
      title: "Site Title",
      type: "string",
      description: " The main title of the website (e.g. 'C-Suite Magazine').",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Site Description",
      type: "text",
      description: "Default SEO description for the homepage and pages without specific descriptions.",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "keywords",
      title: "Default Keywords",
      type: "array",
      of: [{ type: "string" }],
      description: "Default keywords for SEO.",
    }),
    defineField({
      name: "ogImage",
      title: "Default Share Image",
      type: "image",
      description: "The default image used for social sharing cards when no specific image is available.",
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare(selection) {
      return {
        ...selection,
        title: selection.title || "Site Settings",
      };
    },
  },
});
