// Welcome to your schema
//   Schema driven development is Keystone's modus operandi
//
// This file is where we define the lists, fields and hooks for our data.
// If you want to learn more about how lists are configured, please read
// - https://keystonejs.com/docs/config/lists

import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { cloudinaryImage } from '@keystone-6/cloudinary'

// see https://keystonejs.com/docs/fields/overview for the full list of fields
//   this is a few common fields for an example
import {
  text,
  relationship,
  password,
  timestamp,
  select,
  integer,
  checkbox,
} from '@keystone-6/core/fields'

// the document field is a more complicated field, so it has it's own package
import { document } from '@keystone-6/fields-document'
// if you want to make your own fields, see https://keystonejs.com/docs/guides/custom-fields

// when using Typescript, you can refine your types to a stricter subset by importing
// the generated types from '.keystone/types'
import { type Lists } from '.keystone/types'


type Session = {
  data: {
    id: string;
    isAdmin: boolean;
  }
}

const isAdmin = ({ session }: { session?: Session }) => Boolean(session?.data.isAdmin)

export const lists = {
  User: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: {
      operation: {
        query: isAdmin,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
      }
    },
    // access: allowAll,

    // this is the fields for our User list
    fields: {
      // by adding isRequired, we enforce that every User should have a name
      //   if no name is provided, an error will be displayed
      name: text({ validation: { isRequired: true } }),

      email: text({
        validation: { isRequired: true },
        // by adding isIndexed: 'unique', we're saying that no user can have the same
        // email as another user - this may or may not be a good idea for your project
        isIndexed: 'unique',
      }),

      isAdmin: checkbox(),

      password: password({ validation: { isRequired: true } }),

      // we can use this field to see what Posts this User has authored
      //   more on that in the Post list below
      // posts: relationship({ ref: 'Post.author', many: true }),

      createdAt: timestamp({
        // this sets the timestamp to Date.now() when the user is first created
        defaultValue: { kind: 'now' },
      }),
    },
  }),


  Product: list({
    access: {
      operation: {
        query: allowAll,
        create: isAdmin,
        update: isAdmin,
        delete: isAdmin,
      }
    },

    fields: {
      name: text({validation: {isRequired: true}}),
      picture: cloudinaryImage({
        cloudinary: {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'test',
          apiKey: process.env.CLOUDINARY_API_KEY || 'api_key',
          apiSecret: process.env.CLOUDINARY_API_SECRET || 'api_secret',
          folder: process.env.CLOUDINARY_API_PRODUCTS_FOLDER || 'products',
        }
      }), 
      description: document({
        formatting: true,
        links: true,
        dividers: true,
      }),
      stock: integer({
        validation: {isRequired: true},
        defaultValue: 0
      }),
      price: integer({validation: {isRequired: true}})
    }

  }),

  LineItem: list({
    access: {
      operation: {
        query: isAdmin,
        create: allowAll,
        update: isAdmin,
        delete: isAdmin,
      }
    },
    ui: {
      isHidden: true,
    },
    fields: {
      product: relationship({
        ref: 'Product'
      }),
      quantity: integer({validation: {isRequired: true}}),
      purchase: relationship({
        ref: 'Purchase.lineItems'
      })
    }
  }),

  Purchase: list({
    access: {
      operation: {
        query: isAdmin,
        create: allowAll,
        update: isAdmin,
        delete: isAdmin,
      }
    },
    fields: {
      student: text({validation: {isRequired: true}}),
      phoneNumber: text({validation: {isRequired: true}}),
      receiptImage: cloudinaryImage({
        cloudinary: {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'test',
          apiKey: process.env.CLOUDINARY_API_KEY || 'api_key',
          apiSecret: process.env.CLOUDINARY_API_SECRET || 'api_secret',
          folder: process.env.CLOUDINARY_API_RECEIPTS_FOLDER || 'receipts',
        }
      }), 
      lineItems: relationship({
        ref: 'LineItem.purchase',
        many: true,
        ui: {
          displayMode: "cards",
          inlineCreate: {
            fields: ['product', 'quantity']
          },
          cardFields: [
            'product',
            'quantity'
          ]
        }
      }),
      status: select({
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Confirmed', value: 'confirmed' },
          { label: 'Rejected', value: 'rejected' },
        ],
        defaultValue: 'pending',
        ui: { displayMode: 'segmented-control' },
      }),
      notes: text({ ui: { displayMode: 'textarea' } }),
      createdAt: timestamp({ defaultValue: { kind: 'now' } }),
      updatedAt: timestamp({ db: { updatedAt: true } }),
    }
  }),
} satisfies Lists
