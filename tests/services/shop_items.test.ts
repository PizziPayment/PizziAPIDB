// @ts-ignore
import { Sequelize } from 'sequelize'
// @ts-ignore
import { config } from '../common/config'

import { initOrm, Order, ShopItemCreationModel, ShopItemSortBy, ShopItemsService, ShopsServices } from '../../src'
import ShopItem from '../../src/commons/services/orm/models/shop_items.database.model'

// @ts-ignore
import { shop } from '../common/models'

// @ts-ignore
let sequelize: Sequelize = undefined

beforeAll(async () => {
  sequelize = await initOrm(config)
})

afterAll(() => {
  return sequelize.close()
})

const shop_items: Array<ShopItemCreationModel> = [
  {
    name: 'kidney',
    price: 300,
    category: 'category',
  },
  {
    name: 'lung',
    price: 3999,
    category: 'category',
  },
  {
    name: 'leg',
    price: 45000,
  },
]

describe('Shop item domain', () => {
  it('should be able to create a shop item', async () => {
    const t = await sequelize.transaction()

    try {
      const shop_id = (
        await ShopsServices.createShop(shop.name, shop.phone, shop.siret, shop.address, shop.city, shop.zipcode, t)
      )._unsafeUnwrap().id
      const shop_item_sample = shop_items[0]

      const res = await ShopItemsService.createShopItem(
        shop_id,
        shop_item_sample.name,
        shop_item_sample.price,
        shop_item_sample.category,
        undefined,
        t
      )
      expect(res.isOk()).toBeTruthy()
      const created_si_id = res._unsafeUnwrap().id
      const retrieve_si = await ShopItem.findOne({ where: { id: created_si_id }, transaction: t })

      expect(retrieve_si).not.toBeNull()
      if (retrieve_si != null) {
        expect(retrieve_si.name).toBe(shop_item_sample.name)
        expect(retrieve_si.price).toBe(shop_item_sample.price)
        expect(retrieve_si.shop_id).toBe(shop_id)
        expect(retrieve_si.id).toBe(created_si_id)
        expect(retrieve_si.category).toBe(shop_item_sample.category)
      }
    } finally {
      await t.rollback()
    }
  })

  it('should be able to create shop items', async () => {
    const t = await sequelize.transaction()

    try {
      const shop_id = (
        await ShopsServices.createShop(shop.name, shop.phone, shop.siret, shop.address, shop.city, shop.zipcode, t)
      )._unsafeUnwrap().id

      const res = await ShopItemsService.createShopItems(shop_id, shop_items, t)
      expect(res.isOk()).toBeTruthy()
      const created_items = await ShopItem.findAll({ raw: true, transaction: t })
      for (let i = 0; i < shop_items.length; i++) {
        expect(created_items[i].shop_id).toBe(shop_id)
        expect(created_items[i].name).toBe(shop_items[i].name)
        expect(created_items[i].price).toBe(shop_items[i].price)
        expect(created_items[i].category).toBe(shop_items[i].category || null)
      }
    } finally {
      await t.rollback()
    }
  })

  it('should be able to retrieve a shop item from and id', async () => {
    const t = await sequelize.transaction()

    try {
      const shop_id = (
        await ShopsServices.createShop(shop.name, shop.phone, shop.siret, shop.address, shop.city, shop.zipcode, t)
      )._unsafeUnwrap().id
      const shop_item_sample = shop_items[0]

      let res = await ShopItemsService.createShopItem(
        shop_id,
        shop_item_sample.name,
        shop_item_sample.price,
        shop_item_sample.category,
        undefined,
        t
      )
      expect(res.isOk()).toBeTruthy()
      const created_item = res._unsafeUnwrap()
      res = await ShopItemsService.retrieveShopItemFromId(created_item.id, t)
      expect(res.isOk()).toBeTruthy()
      const retrieved_item = res._unsafeUnwrap()

      expect(retrieved_item.id).toBe(created_item.id)
    } finally {
      await t.rollback()
    }
  })

  describe('should be able to retrieve shop items with a given filter', () => {
    const params = [
      [
        {
          page: 1,
          nb_items: 3,
          sort_by: ShopItemSortBy.NAME,
          order: Order.ASC,
          query: '',
          expected_si: [shop_items[0], shop_items[2], shop_items[1]],
        },
      ],
      [
        {
          page: 2,
          nb_items: 1,
          sort_by: ShopItemSortBy.NAME,
          order: Order.DESC,
          query: '',
          expected_si: [shop_items[2]],
        },
      ],
      [
        {
          page: 1,
          nb_items: 1,
          sort_by: ShopItemSortBy.NAME,
          order: Order.ASC,
          query: '',
          expected_si: [shop_items[0]],
        },
      ],
      [
        {
          page: 1,
          nb_items: 2,
          sort_by: ShopItemSortBy.PRICE,
          order: Order.DESC,
          query: '',
          expected_si: [shop_items[2], shop_items[1]],
        },
      ],
      [
        {
          page: 1,
          nb_items: 2,
          sort_by: ShopItemSortBy.NAME,
          order: Order.ASC,
          query: 'l',
          expected_si: [shop_items[2], shop_items[1]],
        },
      ],
    ]

    it.each(params)('Test n%#', async (param) => {
      const { page, nb_items, sort_by, order, query, expected_si } = param
      const t = await sequelize.transaction()

      try {
        const shop_id = (
          await ShopsServices.createShop(shop.name, shop.phone, shop.siret, shop.address, shop.city, shop.zipcode, t)
        )._unsafeUnwrap().id

        const res = await ShopItemsService.createShopItems(shop_id, shop_items, t)
        expect(res.isOk()).toBeTruthy()
        const res_items = await ShopItemsService.retrieveShopItemPage(
          shop_id,
          page,
          nb_items,
          sort_by,
          order,
          query,
          true,
          t
        )

        expect(res_items.isOk()).toBeTruthy()
        const paged_items = res_items._unsafeUnwrap()

        expect(paged_items.length).toBe(expected_si.length)
        for (let i = 0; i < paged_items.length; i++) {
          expect(paged_items[i].name).toBe(expected_si[i].name)
        }
      } finally {
        await t.rollback()
      }
    })
  })

  it('should be able to update a shop item info', async () => {
    const new_price = 45
    const new_name = 'eyebrow'
    const new_category = 'oui'

    const t = await sequelize.transaction()

    try {
      const shop_id = (
        await ShopsServices.createShop(shop.name, shop.phone, shop.siret, shop.address, shop.city, shop.zipcode, t)
      )._unsafeUnwrap().id
      const shop_item_sample = shop_items[2]

      let res = await ShopItemsService.createShopItem(
        shop_id,
        shop_item_sample.name,
        shop_item_sample.price,
        shop_item_sample.category,
        undefined,
        t
      )
      expect(res.isOk()).toBeTruthy()
      const shop_item = res._unsafeUnwrap()

      res = await ShopItemsService.updateShopItemFromId(shop_item.id, new_name, new_price, new_category, t)
      expect(res.isOk()).toBeTruthy()
      const new_shop_item = res._unsafeUnwrap()

      expect(new_shop_item.id).not.toBe(shop_item.id)
      expect(new_shop_item.name).toBe(new_name)
      expect(new_shop_item.price).toBe(new_price)
      expect(new_shop_item.enabled).toBe(true)
      expect(new_shop_item.shop_id).toBe(shop_id)

      expect((await ShopItemsService.retrieveShopItemFromIdAndEnable(shop_item.id, false, t)).isOk())
    } finally {
      await t.rollback()
    }
  })

  it('should be able to delete a shop item', async () => {
    const t = await sequelize.transaction()

    try {
      const shop_id = (
        await ShopsServices.createShop(shop.name, shop.phone, shop.siret, shop.address, shop.city, shop.zipcode, t)
      )._unsafeUnwrap().id
      const shop_item_sample = shop_items[1]

      let res = await ShopItemsService.createShopItem(
        shop_id,
        shop_item_sample.name,
        shop_item_sample.price,
        shop_item_sample.category,
        undefined,
        t
      )
      expect(res.isOk()).toBeTruthy()
      const item = res._unsafeUnwrap()

      res = await ShopItemsService.deleteShopItemById(item.id, t)
      expect(res.isOk()).toBeTruthy()
      const deleted_shop_item = res._unsafeUnwrap()

      res = await ShopItemsService.retrieveShopItemFromIdAndEnable(item.id, false, t)
      expect(res.isOk()).toBeTruthy()
      const retrieved_shop_item = res._unsafeUnwrap()

      expect(deleted_shop_item.id).toBe(item.id)
      expect(deleted_shop_item.enabled).toBe(false)
      expect(deleted_shop_item.id).toBe(retrieved_shop_item.id)
      expect(deleted_shop_item.enabled).toBe(retrieved_shop_item.enabled)
    } finally {
      await t.rollback()
    }
  })
})
