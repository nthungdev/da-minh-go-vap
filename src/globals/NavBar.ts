import { GlobalConfig } from "payload";

const NavBar: GlobalConfig = {
  slug: 'navBar',
  fields: [
    // TODO pageBanners ?
    {
      name: 'bottomDecorativeGraphic',
      type: 'group',
      fields: [
        {
          name: 'enable',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'imageDesktop',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'imageMobile',
          type: 'upload',
          relationTo: 'media',
        },
      ]
    }
  ],
}

export default NavBar