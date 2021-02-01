import {ConduitSchema, TYPE} from '@quintessential-sft/conduit-grpc-sdk';

export const ProductSchema = new ConduitSchema('Product',
  {
    _id: TYPE.ObjectId,
    name: TYPE.String,
    value: TYPE.Number,
    currency: TYPE.String,
    isSubscription: TYPE.Boolean,
    recurring: TYPE.String,
    recurringCount: {
      type: TYPE.Number,
      default: 1
    },
    stripe: {
      subscriptionId: TYPE.String,
      priceId: TYPE.String,
    },
    createdAt: TYPE.Date,
    updatedAt: TYPE.Date
  },
  {
    timestamps: true,
    systemRequired: true
  })